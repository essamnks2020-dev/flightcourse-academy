/**
 * Pattern Perfect — shareable flight-track card generator (dusk edition).
 *
 * Renders the player's trail on a premium dusk-sky card: gradient sky, horizon
 * glow, stars, lit runway, the luminous trail, and a brand + grade overlay.
 * Returns a PNG data URL for download or the Web Share API.
 */

import type {
  PatternGeometry,
  TrailPoint,
  FlightResult,
  Vec2,
} from "./types";
import { drawStandaloneTrail } from "./render";
import type { ScenarioConfig } from "@/lib/data/pattern-scenarios";

export const SHARE_CARD_W = 1280;
export const SHARE_CARD_H = 800;

interface ShareTransform {
  scale: number;
  toX: (x: number) => number;
  toY: (y: number) => number;
  toCanvas: (p: Vec2) => [number, number];
  width: number;
  height: number;
}

export function generateShareCard(
  geo: PatternGeometry,
  trail: TrailPoint[],
  result: FlightResult,
  scenario: ScenarioConfig,
): string {
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas");
  canvas.width = SHARE_CARD_W;
  canvas.height = SHARE_CARD_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Dusk sky gradient.
  const bg = ctx.createLinearGradient(0, 0, 0, SHARE_CARD_H);
  bg.addColorStop(0, "#0a1530");
  bg.addColorStop(0.45, "#102746");
  bg.addColorStop(0.78, "#1a3a5e");
  bg.addColorStop(1, "#2d4a6b");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SHARE_CARD_W, SHARE_CARD_H);

  // Horizon glow.
  const glow = ctx.createRadialGradient(
    SHARE_CARD_W / 2,
    SHARE_CARD_H + 60,
    40,
    SHARE_CARD_W / 2,
    SHARE_CARD_H + 60,
    SHARE_CARD_W * 0.7,
  );
  glow.addColorStop(0, "rgba(242,177,52,0.28)");
  glow.addColorStop(1, "rgba(10,21,48,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, SHARE_CARD_W, SHARE_CARD_H);

  // Stars.
  ctx.save();
  for (let i = 0; i < 90; i++) {
    const x = (i * 137.5) % SHARE_CARD_W;
    const y = ((i * 71.3) % (SHARE_CARD_H * 0.5));
    const r = ((i * 13) % 10) / 10 * 1.2 + 0.3;
    ctx.globalAlpha = 0.3 + ((i * 7) % 10) / 14;
    ctx.fillStyle = "#eaf2fb";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Fit pattern into the card.
  const padTop = 120;
  const padBottom = 140;
  const padX = 90;
  const innerW = SHARE_CARD_W - padX * 2;
  const innerH = SHARE_CARD_H - padTop - padBottom;
  const tf = computeTransformFit(geo, innerW, innerH, padX, padTop);

  // Faint guide rectangle (glowing).
  if (geo.guidePath.length > 1) {
    ctx.save();
    ctx.strokeStyle = "rgba(242,177,52,0.25)";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 12]);
    ctx.shadowColor = "rgba(242,177,52,0.4)";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    const [gx, gy] = tf.toCanvas(geo.guidePath[0]);
    ctx.moveTo(gx, gy);
    for (let i = 1; i < geo.guidePath.length; i++) {
      const [x, y] = tf.toCanvas(geo.guidePath[i]);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // Runway with edge lights.
  ctx.save();
  const [rax, ray] = tf.toCanvas(geo.departureEnd);
  const [rbx, rby] = tf.toCanvas(geo.threshold);
  const rwLen = Math.hypot(rbx - rax, rby - ray);
  const rwAngle = Math.atan2(rby - ray, rbx - rax);
  ctx.translate(rax, ray);
  ctx.rotate(rwAngle);
  const asg = ctx.createLinearGradient(0, -8, 0, 8);
  asg.addColorStop(0, "#0c1729");
  asg.addColorStop(0.5, "#15243d");
  asg.addColorStop(1, "#0c1729");
  ctx.fillStyle = asg;
  ctx.fillRect(0, -8, rwLen, 16);
  // Edge lights.
  const nLights = Math.max(10, Math.floor(rwLen / 45));
  for (let i = 0; i <= nLights; i++) {
    const lx = (rwLen * i) / nLights;
    for (const side of [-1, 1]) {
      ctx.fillStyle = i === 0 || i === nLights ? "#ffd97a" : "#f2b134";
      ctx.shadowColor = "rgba(255,200,90,0.9)";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(lx, (side * 8), 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // The hero trail.
  if (trail.length >= 2) {
    drawStandaloneTrail(ctx, tf, trail);
  }

  // ---- Overlay text ----
  // Brand (top-left).
  ctx.fillStyle = "#eaf2fb";
  ctx.font = "700 30px Sora, Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("FlightCourse", padX, 42);
  ctx.fillStyle = "#f2b134";
  ctx.font = "600 16px Inter, sans-serif";
  ctx.fillText("Pattern Perfect · traffic pattern trainer", padX, 78);

  // Grade + score (top-right).
  const gradeColors: Record<FlightResult["grade"], string> = {
    textbook: "#f2b134",
    solid: "#3e92cc",
    "needs-work": "#94abcc",
    redo: "#ff5a6f",
  };
  const gc = gradeColors[result.grade];
  ctx.textAlign = "right";
  ctx.shadowColor = gc;
  ctx.shadowBlur = 24;
  ctx.fillStyle = gc;
  ctx.font = "800 46px Sora, Inter, sans-serif";
  ctx.fillText(result.gradeLabel, SHARE_CARD_W - padX, 36);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#94abcc";
  ctx.font = "500 16px Inter, sans-serif";
  ctx.fillText(`${result.totalScore} / 100`, SHARE_CARD_W - padX, 90);

  // Footer (bottom-left): airport.
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillStyle = "#eaf2fb";
  ctx.font = "600 18px Inter, sans-serif";
  const airport = scenario.airportKey.includes("cedar")
    ? "Cedar Lake"
    : scenario.airportKey.includes("meadow")
      ? "Meadowfield"
      : "Riverside";
  ctx.fillText(
    `${airport} · Runway ${scenario.runway.runwayNumber} ${scenario.runway.trafficDirection === "right" ? "R" : "L"} traffic`,
    padX,
    SHARE_CARD_H - 62,
  );
  ctx.fillStyle = "#94abcc";
  ctx.font = "400 14px Inter, sans-serif";
  ctx.fillText(
    `Pattern altitude ${geo.dims.patternAltitudeFt} ft · ${Math.round(result.flightTimeSec)}s flight · ${result.conflicts} spacing alert(s)`,
    padX,
    SHARE_CARD_H - 38,
  );

  // Footer (bottom-right): why summary.
  ctx.textAlign = "right";
  ctx.fillStyle = "#94abcc";
  ctx.font = "400 13px Inter, sans-serif";
  wrapText(
    ctx,
    result.why,
    SHARE_CARD_W - padX,
    SHARE_CARD_H - 62,
    470,
    18,
    SHARE_CARD_H - 38,
  );

  return canvas.toDataURL("image/png");
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxY: number,
) {
  const words = text.split(" ");
  let line = "";
  const lines: string[] = [];
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  ctx.textBaseline = "bottom";
  for (let i = 0; i < Math.min(lines.length, 3); i++) {
    const cy = y + i * lineHeight;
    if (cy > maxY) break;
    ctx.fillText(lines[i], x, cy);
  }
}

function computeTransformFit(
  geo: PatternGeometry,
  innerW: number,
  innerH: number,
  offX: number,
  offY: number,
): ShareTransform {
  const { minX, maxX, minY, maxY } = geo.bounds;
  const w = maxX - minX;
  const h = maxY - minY;
  const scale = Math.min(innerW / w, innerH / h);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const toX = (x: number) => (x - cx) * scale + offX + innerW / 2;
  const toY = (y: number) => offY + innerH / 2 - (y - cy) * scale;
  return {
    scale,
    toX,
    toY,
    toCanvas: (p) => [toX(p.x), toY(p.y)],
    width: SHARE_CARD_W,
    height: SHARE_CARD_H,
  };
}
