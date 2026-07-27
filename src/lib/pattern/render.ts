/**
 * Pattern Perfect — canvas renderer (dusk-twilight edition).
 *
 * The scene is a living dusk sky viewed top-down: a gradient from deep navy
 * (overhead) to warm gold (horizon glow), twinkling stars, drifting cloud
 * shadows over textured terrain, a crisply-marked runway with glowing edge
 * lights, a detailed C172 with a spinning prop and nav lights, and the hero
 * trail rendered as a luminous, particle-flecked bezier path.
 *
 * Canvas 2D is chosen over SVG because the trail accumulates hundreds of points
 * and is redrawn every frame; layered shadow-blur strokes + particle sprites are
 * far cheaper than hundreds of DOM path elements.
 */

import type {
  PatternGeometry,
  AircraftState,
  AIActor,
  TrailPoint,
  Vec2,
  Wind,
  LegName,
} from "./types";
import type { ParticleSystem } from "./particles";
import { getAsset } from "./assets";

export type TimeOfDay = "dawn" | "day" | "dusk" | "night";

export interface Transform {
  scale: number;
  toX: (x: number) => number;
  toY: (y: number) => number;
  toCanvas: (p: Vec2) => [number, number];
  width: number;
  height: number;
}

export function computeTransform(
  geo: PatternGeometry,
  width: number,
  height: number,
  padding = 44,
): Transform {
  const { minX, maxX, minY, maxY } = geo.bounds;
  const w = maxX - minX;
  const h = maxY - minY;
  const scale = Math.min((width - padding * 2) / w, (height - padding * 2) / h);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const toX = (x: number) => (x - cx) * scale + width / 2;
  const toY = (y: number) => height / 2 - (y - cy) * scale;
  return {
    scale,
    toX,
    toY,
    toCanvas: (p) => [toX(p.x), toY(p.y)],
    width,
    height,
  };
}

/* ------------------------------- scene render ---------------------------- */

export interface RenderParams {
  ctx: CanvasRenderingContext2D;
  tf: Transform;
  geo: PatternGeometry;
  player: AircraftState;
  playerTrail: TrailPoint[];
  ai: AIActor[];
  wind: Wind;
  timeSec: number;
  guideAlpha: number;
  highlightLeg?: LegName | null;
  conflict?: "none" | "warn" | "critical";
  showLabels: boolean;
  timeOfDay?: TimeOfDay;
  particles?: ParticleSystem | null;
  windVxPx?: number; // wind in screen px/s for streaks
  windVyPx?: number;
  airportKey?: string; // for distinct terrain per airport
}

// Persistent decorative state (stars, clouds) — seeded once per canvas size.
interface DecoState {
  stars: { x: number; y: number; r: number; phase: number }[];
  clouds: { x: number; y: number; r: number; speed: number; alpha: number }[];
  terrainBlotches: { x: number; y: number; r: number; hue: number }[];
  initW: number;
  initH: number;
}
let deco: DecoState | null = null;

function ensureDeco(w: number, h: number) {
  if (deco && deco.initW === w && deco.initH === h) return deco;
  const stars: DecoState["stars"] = [];
  for (let i = 0; i < 70; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h * 0.55,
      r: Math.random() * 1.3 + 0.3,
      phase: Math.random() * Math.PI * 2,
    });
  }
  const clouds: DecoState["clouds"] = [];
  for (let i = 0; i < 6; i++) {
    clouds.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 60 + Math.random() * 90,
      speed: 4 + Math.random() * 8,
      alpha: 0.05 + Math.random() * 0.07,
    });
  }
  const terrainBlotches: DecoState["terrainBlotches"] = [];
  for (let i = 0; i < 26; i++) {
    terrainBlotches.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 30 + Math.random() * 70,
      hue: Math.random(),
    });
  }
  deco = { stars, clouds, terrainBlotches, initW: w, initH: h };
  return deco;
}

export function renderScene(p: RenderParams) {
  const { ctx, tf, geo } = p;
  const tod = p.timeOfDay ?? "dusk";
  ctx.clearRect(0, 0, tf.width, tf.height);
  drawSky(ctx, tf, p.timeSec, tod);
  drawTerrain(ctx, tf, geo, p.timeSec, p.airportKey);
  drawRunway(ctx, tf, geo, p.timeSec, tod);
  if (p.guideAlpha > 0.01) drawGuide(ctx, tf, geo, p.guideAlpha, p.timeSec);
  drawRadioPoints(ctx, tf, geo, p.timeSec);
  for (const a of p.ai) drawAITrail(ctx, tf, a);
  for (const a of p.ai) {
    if (!a.active) continue;
    // AI traffic variety: cycle through available sprites (taildragger, lowwing,
    // c172) so the pattern has mixed aircraft types. Falls back to procedural.
    const aiSprites = [getAsset("taildragger-top"), getAsset("lowwing-top"), getAsset("c172-top")];
    const aiSprite = aiSprites[(a.id.length + (a.callsign.length || 0)) % aiSprites.length];
    drawAircraft(ctx, tf, a.state, a.color, 0.78, p.timeSec, false, aiSprite);
  }
  drawPlayerTrail(ctx, tf, p.playerTrail, p.timeSec);
  drawAircraft(ctx, tf, p.player, "#f2b134", 1, p.timeSec, true, getAsset("c172-top"));
  if (p.conflict === "critical")
    drawConflictShockwave(ctx, tf, p.player, p.timeSec, true);
  else if (p.conflict === "warn")
    drawConflictRing(ctx, tf, p.player, p.timeSec);
  drawWindSock(ctx, tf, geo, p.wind, p.timeSec);
  // Wind streaks (screen-space) + world-space particles through the transform.
  if (p.particles) {
    // Screen-space wind streaks first (behind world particles).
    if (p.windVxPx !== undefined && p.windVyPx !== undefined && Math.abs(p.windVxPx) + Math.abs(p.windVyPx) > 5) {
      p.particles.windStreak(p.windVxPx, p.windVyPx, tf.width, tf.height);
      // Render only streaks in screen space.
      p.particles.renderType(ctx, "streak");
    }
    // World-space sparks/exhaust/popups through the camera transform.
    p.particles.renderWorld(ctx, tf);
  }
}

/* --------------------------------- sky ----------------------------------- */

interface SkyPalette {
  top: string;
  mid: string;
  lower: string;
  horizon: string;
  glowColor: string;
  glowMid: string;
  starAlpha: number; // 0..1 visibility of stars
}

function skyPaletteFor(tod: TimeOfDay): SkyPalette {
  switch (tod) {
    case "dawn":
      return {
        top: "#1a2a4a",
        mid: "#2d3f63",
        lower: "#5a5a78",
        horizon: "#d98a5a",
        glowColor: "rgba(255,158,90,0.32)",
        glowMid: "rgba(242,140,80,0.12)",
        starAlpha: 0.25,
      };
    case "day":
      return {
        top: "#1e4a7a",
        mid: "#3a72a8",
        lower: "#6fa8d8",
        horizon: "#a8d0f0",
        glowColor: "rgba(255,240,200,0.18)",
        glowMid: "rgba(255,240,200,0.08)",
        starAlpha: 0,
      };
    case "dusk":
      return {
        top: "#0a1530",
        mid: "#102746",
        lower: "#1a3a5e",
        horizon: "#2d4a6b",
        glowColor: "rgba(242,177,52,0.28)",
        glowMid: "rgba(255,158,61,0.1)",
        starAlpha: 0.7,
      };
    case "night":
      return {
        top: "#040814",
        mid: "#081428",
        lower: "#0c1e3a",
        horizon: "#102844",
        glowColor: "rgba(62,146,204,0.12)",
        glowMid: "rgba(62,146,204,0.05)",
        starAlpha: 1,
      };
  }
}

function drawSky(ctx: CanvasRenderingContext2D, tf: Transform, timeSec: number, tod: TimeOfDay) {
  const d = ensureDeco(tf.width, tf.height);
  const pal = skyPaletteFor(tod);
  const g = ctx.createLinearGradient(0, 0, 0, tf.height);
  g.addColorStop(0, pal.top);
  g.addColorStop(0.45, pal.mid);
  g.addColorStop(0.78, pal.lower);
  g.addColorStop(1, pal.horizon);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, tf.width, tf.height);

  // Horizon glow.
  const horizon = ctx.createRadialGradient(
    tf.width / 2,
    tf.height + 60,
    40,
    tf.width / 2,
    tf.height + 60,
    tf.width * 0.7,
  );
  horizon.addColorStop(0, pal.glowColor);
  horizon.addColorStop(0.5, pal.glowMid);
  horizon.addColorStop(1, "rgba(10,21,48,0)");
  ctx.fillStyle = horizon;
  ctx.fillRect(0, 0, tf.width, tf.height);

  // Stars (twinkle) — visibility depends on time of day.
  if (pal.starAlpha > 0) {
    ctx.save();
    for (const s of d.stars) {
      const a = pal.starAlpha * (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(timeSec * 1.6 + s.phase)));
      ctx.globalAlpha = a;
      ctx.fillStyle = "#eaf2fb";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Drifting cloud shadows (soft, slow).
  ctx.save();
  for (const c of d.clouds) {
    const x = ((c.x + timeSec * c.speed) % (tf.width + c.r * 2)) - c.r;
    const grad = ctx.createRadialGradient(x, c.y, 0, x, c.y, c.r);
    grad.addColorStop(0, `rgba(234,242,251,${c.alpha})`);
    grad.addColorStop(1, "rgba(234,242,251,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/* ------------------------------- terrain --------------------------------- */

/** Per-airport terrain identity — distinct palettes + patterns, not just relabeled. */
interface TerrainStyle {
  blotchColors: string[]; // rgba-ish hue triples
  fieldColor: string;
  pattern: "farmland" | "coastal" | "mountain" | "default";
}

function terrainStyleFor(airportKey?: string): TerrainStyle {
  switch (airportKey) {
    case "riverside":
      return {
        blotchColors: ["62,92,58", "78,98,60", "90,110,70"],
        fieldColor: "45,74,107",
        pattern: "farmland",
      };
    case "cedarlake":
      return {
        blotchColors: ["50,80,110", "70,120,140", "90,150,170"],
        fieldColor: "40,70,100",
        pattern: "coastal",
      };
    case "meadowfield":
      return {
        blotchColors: ["92,78,52", "110,95,60", "80,70,48"],
        fieldColor: "60,50,40",
        pattern: "mountain",
      };
    default:
      return {
        blotchColors: ["62,92,58", "78,98,60"],
        fieldColor: "45,74,107",
        pattern: "default",
      };
  }
}

function drawTerrain(
  ctx: CanvasRenderingContext2D,
  tf: Transform,
  geo: PatternGeometry,
  timeSec: number,
  airportKey?: string,
) {
  const d = ensureDeco(tf.width, tf.height);
  const style = terrainStyleFor(airportKey);
  ctx.save();
  // Soft terrain blotches (fields / vegetation) under the airport.
  for (const b of d.terrainBlotches) {
    const hue = style.blotchColors[Math.floor(b.hue * style.blotchColors.length) % style.blotchColors.length];
    const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    grad.addColorStop(0, `rgba(${hue},0.16)`);
    grad.addColorStop(1, `rgba(${hue},0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  }
  // Distinct pattern overlay per airport identity.
  if (style.pattern === "farmland") {
    // Faint grid lines (field boundaries).
    ctx.strokeStyle = "rgba(62,92,58,0.12)";
    ctx.lineWidth = 1;
    const grid = 90;
    for (let x = 0; x < tf.width; x += grid) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, tf.height);
      ctx.stroke();
    }
    for (let y = 0; y < tf.height; y += grid) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(tf.width, y);
      ctx.stroke();
    }
  } else if (style.pattern === "coastal") {
    // Water band along one edge (coastal field).
    const waterGrad = ctx.createLinearGradient(0, tf.height * 0.7, 0, tf.height);
    waterGrad.addColorStop(0, "rgba(50,80,110,0)");
    waterGrad.addColorStop(1, "rgba(40,70,100,0.35)");
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, tf.height * 0.7, tf.width, tf.height * 0.3);
  } else if (style.pattern === "mountain") {
    // Elevation contour rings (high-desert / mountain valley).
    ctx.strokeStyle = "rgba(110,95,60,0.1)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(tf.width * 0.3, tf.height * 0.8, 120 + i * 80, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  // Airport field disc — a subtle lighter patch under the runway.
  const [fx, fy] = tf.toCanvas(geo.runwayMid);
  const fieldR = Math.max(tf.width, tf.height) * 0.32;
  const field = ctx.createRadialGradient(fx, fy, 0, fx, fy, fieldR);
  field.addColorStop(0, `rgba(${style.fieldColor},0.5)`);
  field.addColorStop(0.6, `rgba(${style.fieldColor},0.25)`);
  field.addColorStop(1, "rgba(10,21,48,0)");
  ctx.fillStyle = field;
  ctx.beginPath();
  ctx.arc(fx, fy, fieldR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  void timeSec;
}

/* -------------------------------- runway --------------------------------- */

function drawRunway(
  ctx: CanvasRenderingContext2D,
  tf: Transform,
  geo: PatternGeometry,
  timeSec: number,
  tod: TimeOfDay,
) {
  const lightBoost = tod === "night" || tod === "dusk" ? 1.4 : tod === "dawn" ? 1.15 : 0.7;
  const rw = geo.legs.find((l) => l.name === "final")!;
  const [ax, ay] = tf.toCanvas(rw.start);
  const [bx, by] = tf.toCanvas(geo.departureEnd);
  const len = Math.hypot(bx - ax, by - ay);
  const angle = Math.atan2(by - ay, bx - ax);
  const widthPx = 18;

  ctx.save();
  ctx.translate(ax, ay);
  ctx.rotate(angle);

  // Runway shadow (offset, soft).
  ctx.save();
  ctx.translate(2, 4);
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  roundRect(ctx, 0, -widthPx / 2, len, widthPx, 4);
  ctx.filter = "blur(4px)";
  ctx.fill();
  ctx.restore();

  // Runway asphalt body with subtle gradient.
  const asg = ctx.createLinearGradient(0, -widthPx / 2, 0, widthPx / 2);
  asg.addColorStop(0, "#0c1729");
  asg.addColorStop(0.5, "#15243d");
  asg.addColorStop(1, "#0c1729");
  ctx.fillStyle = asg;
  roundRect(ctx, 0, -widthPx / 2, len, widthPx, 4);
  ctx.fill();

  // Edge lights (glowing gold dots along both edges).
  const lightPulse = 0.7 + 0.3 * Math.sin(timeSec * 2);
  const nLights = Math.max(8, Math.floor(len / 40));
  for (let i = 0; i <= nLights; i++) {
    const lx = (len * i) / nLights;
    for (const side of [-1, 1]) {
      const ly = (side * widthPx) / 2;
      ctx.save();
      ctx.shadowColor = "rgba(255,200,90,0.9)";
      ctx.shadowBlur = 8 * lightPulse * lightBoost;
      ctx.fillStyle = i === 0 || i === nLights ? "#ffd97a" : "#f2b134";
      ctx.beginPath();
      ctx.arc(lx, ly, (1.8 + (lightBoost - 1) * 1.2) * lightPulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Threshold stripes.
  ctx.fillStyle = "rgba(234,242,251,0.6)";
  for (let i = 0; i < 6; i++) {
    ctx.fillRect(8 + i * 6, -widthPx / 2 + 3, 3, widthPx - 6);
  }

  // Centerline dashes.
  ctx.strokeStyle = "rgba(234,242,251,0.75)";
  ctx.lineWidth = 2;
  ctx.setLineDash([14, 12]);
  ctx.beginPath();
  ctx.moveTo(44, 0);
  ctx.lineTo(len - 44, 0);
  ctx.stroke();
  ctx.setLineDash([]);

  // Runway numbers (approach end + reciprocal).
  ctx.fillStyle = "#eaf2fb";
  ctx.font = "700 13px 'JetBrains Mono', ui-monospace, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.save();
  ctx.translate(len - 16, 0);
  ctx.rotate(Math.PI);
  ctx.fillText(geo.runway.runwayNumber, 0, -widthPx / 2 - 12);
  ctx.restore();
  ctx.fillText(geo.runway.runwayReciprocal, 16, -widthPx / 2 - 12);

  ctx.restore();
}

/* ------------------------------- guide track ----------------------------- */

function drawGuide(
  ctx: CanvasRenderingContext2D,
  tf: Transform,
  geo: PatternGeometry,
  alpha: number,
  timeSec: number,
) {
  if (geo.guidePath.length < 2) return;
  ctx.save();
  // Glowing dashed gold guide.
  ctx.shadowColor = "rgba(242,177,52,0.5)";
  ctx.shadowBlur = 6;
  ctx.strokeStyle = `rgba(242,177,52,${0.5 * alpha})`;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([12, 12]);
  ctx.lineDashOffset = -(timeSec * 14) % 24;
  ctx.beginPath();
  const [x0, y0] = tf.toCanvas(geo.guidePath[0]);
  ctx.moveTo(x0, y0);
  for (let i = 1; i < geo.guidePath.length; i++) {
    const [x, y] = tf.toCanvas(geo.guidePath[i]);
    ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // Corner waypoints (pulsing).
  for (let i = 0; i < [geo.mergePoint, geo.midfieldDownwind, geo.turnBasePoint, geo.turnFinalPoint].length; i++) {
    const wp = [geo.mergePoint, geo.midfieldDownwind, geo.turnBasePoint, geo.turnFinalPoint][i];
    const [x, y] = tf.toCanvas(wp);
    const pulse = 0.5 + 0.5 * Math.sin(timeSec * 2.5 + i);
    ctx.fillStyle = `rgba(242,177,52,${0.7 * alpha})`;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(x, y, 3 + pulse * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/* ----------------------------- radio call pts ---------------------------- */

function drawRadioPoints(
  ctx: CanvasRenderingContext2D,
  tf: Transform,
  geo: PatternGeometry,
  timeSec: number,
) {
  ctx.save();
  geo.radioCallPoints.forEach((rp, i) => {
    const [x, y] = tf.toCanvas(rp.pos);
    const pulse = 0.5 + 0.5 * Math.sin(timeSec * 2 + i * 1.3);
    // Outer pulsing ring.
    ctx.strokeStyle = `rgba(111,183,230,${0.35 + 0.3 * pulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 9 + pulse * 5, 0, Math.PI * 2);
    ctx.stroke();
    // Inner dot.
    ctx.fillStyle = `rgba(111,183,230,${0.5 + 0.3 * pulse})`;
    ctx.shadowColor = "rgba(111,183,230,0.6)";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });
  ctx.restore();
}

/* ------------------------------- AI trail -------------------------------- */

function drawAITrail(ctx: CanvasRenderingContext2D, tf: Transform, a: AIActor) {
  if (a.trail.length < 2) return;
  ctx.save();
  ctx.strokeStyle = a.color;
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 7]);
  ctx.beginPath();
  const [x0, y0] = tf.toCanvas(a.trail[0]);
  ctx.moveTo(x0, y0);
  for (let i = 1; i < a.trail.length; i++) {
    const [x, y] = tf.toCanvas(a.trail[i]);
    ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

/* ------------------------------ player trail ----------------------------- */

/**
 * The hero visual. Quadratic-midpoint-smoothed path through the trail with
 * three layered strokes (outer glow → gradient mid → white core) plus sparkle
 * particles along the most recent segment for a luminous, alive feel.
 */
function drawPlayerTrail(
  ctx: CanvasRenderingContext2D,
  tf: Transform,
  trail: TrailPoint[],
  timeSec: number,
) {
  if (trail.length < 2) return;
  const pts: [number, number][] = trail.map((p) => tf.toCanvas(p));

  const first = pts[0];
  const last = pts[pts.length - 1];
  const grad = ctx.createLinearGradient(first[0], first[1], last[0], last[1]);
  grad.addColorStop(0, "#3e92cc");
  grad.addColorStop(0.5, "#9ad0f0");
  grad.addColorStop(1, "#f2b134");

  const buildPath = () => {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) {
      const midX = (pts[i][0] + pts[i + 1][0]) / 2;
      const midY = (pts[i][1] + pts[i + 1][1]) / 2;
      ctx.quadraticCurveTo(pts[i][0], pts[i][1], midX, midY);
    }
    ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
  };

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Outer wide glow.
  ctx.shadowColor = "rgba(242,177,52,0.8)";
  ctx.shadowBlur = 22;
  ctx.strokeStyle = "rgba(242,177,52,0.16)";
  ctx.lineWidth = 16;
  buildPath();
  ctx.stroke();

  // Mid gradient stroke.
  ctx.shadowBlur = 8;
  ctx.strokeStyle = grad;
  ctx.globalAlpha = 0.96;
  ctx.lineWidth = 5;
  buildPath();
  ctx.stroke();

  // Core white highlight.
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = 1.5;
  buildPath();
  ctx.stroke();

  // Sparkle particles at the leading edge (most recent ~12 points).
  ctx.globalAlpha = 1;
  const leadCount = Math.min(12, pts.length);
  for (let i = pts.length - leadCount; i < pts.length; i++) {
    const t = (i - (pts.length - leadCount)) / leadCount;
    const [px, py] = pts[i];
    const sparkAlpha = t * 0.7;
    const sparkR = 0.8 + t * 2.2;
    ctx.fillStyle = `rgba(255,230,150,${sparkAlpha})`;
    ctx.shadowColor = "rgba(242,177,52,0.9)";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(px, py, sparkR, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  void timeSec;
}

/* -------------------------------- aircraft ------------------------------- */

function drawAircraft(
  ctx: CanvasRenderingContext2D,
  tf: Transform,
  s: AircraftState,
  accent: string,
  alpha: number,
  timeSec: number,
  isPlayer: boolean,
  sprite?: HTMLImageElement | null,
) {
  const [cx, cy] = tf.toCanvas(s.pos);
  const headingRad = (s.headingDeg * Math.PI) / 180;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalAlpha = alpha;

  // Soft ground shadow (offset by bank, gives a lean feel).
  ctx.save();
  ctx.rotate(headingRad);
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.filter = "blur(3px)";
  ctx.beginPath();
  ctx.ellipse(s.bankDeg * 0.5, 7, 17, 7.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.rotate(headingRad);

  // Illustrated sprite path (progressive enhancement). If a sprite is loaded,
  // draw it rotated to heading and skip the procedural body. The sprite is a
  // top-down asset pointing "up" (−y), matching our coordinate convention.
  if (sprite) {
    const size = 42; // px draw size — holds up at the camera's tightest zoom
    ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
    // Nav lights as a subtle overlay (sprite is static).
    ctx.fillStyle = "#ff4444";
    ctx.shadowColor = "#ff4444";
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(-17, 1, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#44ff66";
    ctx.shadowColor = "#44ff66";
    ctx.beginPath();
    ctx.arc(17, 1, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Spinning prop for the player.
    if (isPlayer) {
      const propPhase = timeSec * 40;
      ctx.globalAlpha = alpha * 0.4;
      ctx.fillStyle = "rgba(234,242,251,0.5)";
      ctx.beginPath();
      ctx.ellipse(0, -21, 7, 1.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "rgba(50,60,80,0.9)";
      ctx.lineWidth = 1.4;
      for (let b = 0; b < 2; b++) {
        const a = propPhase + b * Math.PI;
        ctx.beginPath();
        ctx.moveTo(0, -21);
        ctx.lineTo(Math.sin(a) * 6, -21 - Math.cos(a) * 1.5);
        ctx.stroke();
      }
    }
    ctx.restore();
    return;
  }

  // Procedural fallback (original detailed C172 drawing).
  // Fuselage (gradient body).
  const bodyGrad = ctx.createLinearGradient(-4, 0, 4, 0);
  bodyGrad.addColorStop(0, "#cfe0f2");
  bodyGrad.addColorStop(0.5, "#eaf2fb");
  bodyGrad.addColorStop(1, "#aebfd4");
  ctx.fillStyle = bodyGrad;
  roundRect(ctx, -3.4, -17, 6.8, 32, 3.2);
  ctx.fill();

  // Cabin / windshield (dark tinted).
  ctx.fillStyle = "rgba(20,40,70,0.85)";
  roundRect(ctx, -2.6, -7, 5.2, 8, 2);
  ctx.fill();

  // Nose accent.
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(0, -17, 2.6, 0, Math.PI * 2);
  ctx.fill();

  // Main wings with sweep.
  ctx.fillStyle = "#cfe0f2";
  ctx.beginPath();
  ctx.moveTo(-17, 1);
  ctx.lineTo(-15, 7);
  ctx.lineTo(15, 7);
  ctx.lineTo(17, 1);
  ctx.lineTo(10, -2);
  ctx.lineTo(-10, -2);
  ctx.closePath();
  ctx.fill();
  // Wing accent stripe.
  ctx.fillStyle = accent;
  ctx.fillRect(-2.2, -1, 4.4, 6.5);

  // Navigation lights: red on left wingtip, green on right.
  ctx.fillStyle = "#ff4444";
  ctx.shadowColor = "#ff4444";
  ctx.shadowBlur = 5;
  ctx.beginPath();
  ctx.arc(-17, 1, 1.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#44ff66";
  ctx.shadowColor = "#44ff66";
  ctx.beginPath();
  ctx.arc(17, 1, 1.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Horizontal stabilizer.
  ctx.fillStyle = "#cfe0f2";
  ctx.beginPath();
  ctx.moveTo(-6.5, 13);
  ctx.lineTo(-6, 16);
  ctx.lineTo(6, 16);
  ctx.lineTo(6.5, 13);
  ctx.lineTo(2.2, 12);
  ctx.lineTo(-2.2, 12);
  ctx.closePath();
  ctx.fill();

  // Spinning propeller disc (player only, animated).
  if (isPlayer) {
    const propPhase = timeSec * 40;
    ctx.globalAlpha = alpha * 0.35;
    ctx.fillStyle = "rgba(234,242,251,0.5)";
    ctx.beginPath();
    ctx.ellipse(0, -19, 7, 1.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = alpha;
    // Prop blades.
    ctx.strokeStyle = "rgba(50,60,80,0.9)";
    ctx.lineWidth = 1.4;
    for (let b = 0; b < 2; b++) {
      const a = propPhase + (b * Math.PI);
      ctx.beginPath();
      ctx.moveTo(0, -19);
      ctx.lineTo(Math.sin(a) * 6, -19 - Math.cos(a) * 1.5);
      ctx.stroke();
    }
  }

  ctx.restore();
}

/* ---------------------------- conflict effects --------------------------- */

function drawConflictShockwave(
  ctx: CanvasRenderingContext2D,
  tf: Transform,
  s: AircraftState,
  timeSec: number,
  critical: boolean,
) {
  const [x, y] = tf.toCanvas(s.pos);
  const pulse = 0.5 + 0.5 * Math.sin(timeSec * 6);
  ctx.save();
  // Expanding shockwave rings.
  for (let r = 0; r < 3; r++) {
    const phase = (timeSec * 2 + r * 0.6) % 1;
    const radius = 20 + phase * 60;
    ctx.strokeStyle = `rgba(255,90,111,${(1 - phase) * 0.5})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Solid danger core.
  ctx.strokeStyle = "#ff5a6f";
  ctx.globalAlpha = 0.7 + 0.3 * pulse;
  ctx.lineWidth = 3;
  ctx.shadowColor = "rgba(255,90,111,0.8)";
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.arc(x, y, 26 + pulse * 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 0.18 + 0.1 * pulse;
  ctx.fillStyle = "#ff5a6f";
  ctx.beginPath();
  ctx.arc(x, y, 26 + pulse * 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  void critical;
}

function drawConflictRing(
  ctx: CanvasRenderingContext2D,
  tf: Transform,
  s: AircraftState,
  timeSec: number,
) {
  const [x, y] = tf.toCanvas(s.pos);
  const pulse = 0.5 + 0.5 * Math.sin(timeSec * 5);
  ctx.save();
  ctx.strokeStyle = "#f2b134";
  ctx.globalAlpha = 0.65 + 0.25 * pulse;
  ctx.lineWidth = 2;
  ctx.shadowColor = "rgba(242,177,52,0.6)";
  ctx.shadowBlur = 10;
  ctx.setLineDash([6, 6]);
  ctx.lineDashOffset = -(timeSec * 10) % 12;
  ctx.beginPath();
  ctx.arc(x, y, 28 + pulse * 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

/* ------------------------------ wind sock -------------------------------- */

function drawWindSock(
  ctx: CanvasRenderingContext2D,
  tf: Transform,
  geo: PatternGeometry,
  wind: Wind,
  timeSec: number,
) {
  const sockPos = {
    x: geo.threshold.x - geo.along.x * 350,
    y: geo.threshold.y - geo.along.y * 350 + geo.side.y * 260,
  };
  const [sx, sy] = tf.toCanvas(sockPos);
  const toward = wind.fromHeadingDeg + 180;
  const wob = Math.sin(timeSec * 1.3) * 6 * (wind.gustKt > 0 ? 1 : 0.3);
  const angle = ((toward + wob) * Math.PI) / 180;
  const len = 16 + wind.speedKt * 1.1;

  ctx.save();
  ctx.translate(sx, sy);
  // Pole base circle.
  ctx.fillStyle = "rgba(234,242,251,0.25)";
  ctx.beginPath();
  ctx.arc(0, 2, 4, 0, Math.PI * 2);
  ctx.fill();
  // Pole.
  ctx.strokeStyle = "rgba(234,242,251,0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.lineTo(0, -10);
  ctx.stroke();
  // Sock cone.
  ctx.rotate(-angle + Math.PI / 2);
  const grad = ctx.createLinearGradient(0, 0, len, 0);
  grad.addColorStop(0, "#f2b134");
  grad.addColorStop(1, "#ff5a6f");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, -3);
  ctx.lineTo(len, -1);
  ctx.lineTo(len, 1);
  ctx.lineTo(0, 3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* -------------------------------- helpers -------------------------------- */

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Standalone trail draw for the share card. */
export function drawStandaloneTrail(
  ctx: CanvasRenderingContext2D,
  tf: Transform,
  trail: TrailPoint[],
) {
  drawPlayerTrail(ctx, tf, trail, 0);
}
