/**
 * Pattern Perfect — dynamic follow camera.
 *
 * Inspired by Mini Motor Racing / Geometry Wars: the camera follows the player
 * with spring lag, leads slightly in the direction of travel, and zooms based on
 * context (wider on downwind to spot traffic, tighter on final to judge
 * alignment). A minimap keeps the full pattern + all traffic visible at all
 * times so the strategic overview is never lost.
 *
 * All smoothing is frame-rate independent (uses exponential decay with dt).
 */

import type { AircraftState, AIActor, LegName, PatternGeometry, Vec2 } from "./types";
import { dist, clamp, lerp } from "./geometry";

export interface CameraState {
  cx: number; // world center x the camera looks at
  cy: number;
  zoom: number; // world-ft per canvas-pixel-ish unit (higher = zoomed in)... we use scale
  shake: number; // 0..1 shake intensity, decays
  shakeX: number;
  shakeY: number;
}

export interface CameraTarget {
  pos: Vec2;
  headingDeg: number;
  leg: LegName;
  airspeedKt: number;
}

export const BASE_VIEW_FT = 7200; // overview-ish width in world ft at zoom 1
const FOLLOW_LAG = 3.2; // higher = snappier
const ZOOM_LAG = 2.5;

/** Desired zoom (scale multiplier). 1 = overview; >1 = zoomed in. */
function desiredZoom(leg: LegName, airspeedKt: number): number {
  // Tighter on final/rollout (judge alignment), widest on downwind (spot traffic).
  switch (leg) {
    case "entry":
      return 1.15;
    case "downwind":
      return 1.1;
    case "base":
      return 1.25;
    case "final":
      return 1.45;
    case "rollout":
      return 1.5;
  }
}

/** Desired camera focus point (player + lookahead). */
function desiredCenter(t: CameraTarget, geo: PatternGeometry, zoom: number): Vec2 {
  // Lookahead: lead in the direction of travel, scaled by speed and inversely by zoom.
  const aheadFt = clamp(t.airspeedKt * 9, 200, 1600) / zoom;
  const rad = (t.headingDeg * Math.PI) / 180;
  return {
    x: t.pos.x + Math.sin(rad) * aheadFt,
    y: t.pos.y + Math.cos(rad) * aheadFt,
  };
}

export function createCamera(geo: PatternGeometry): CameraState {
  return {
    cx: geo.runwayMid.x,
    cy: geo.runwayMid.y,
    zoom: 1,
    shake: 0,
    shakeX: 0,
    shakeY: 0,
  };
}

export function updateCamera(
  cam: CameraState,
  target: CameraTarget,
  geo: PatternGeometry,
  dt: number,
): CameraState {
  const dz = desiredZoom(target.leg, target.airspeedKt);
  // Exponential smoothing (frame-rate independent).
  const zAlpha = 1 - Math.exp(-ZOOM_LAG * dt);
  const newZoom = cam.zoom + (dz - cam.zoom) * zAlpha;

  const dc = desiredCenter(target, geo, newZoom);
  const cAlpha = 1 - Math.exp(-FOLLOW_LAG * dt);
  const ncx = cam.cx + (dc.x - cam.cx) * cAlpha;
  const ncy = cam.cy + (dc.y - cam.cy) * cAlpha;

  // Shake decay.
  let shake = cam.shake - dt * 2.5;
  if (shake < 0) shake = 0;
  const shakeX = shake > 0 ? (Math.random() - 0.5) * shake * 60 : 0;
  const shakeY = shake > 0 ? (Math.random() - 0.5) * shake * 60 : 0;

  return { cx: ncx, cy: ncy, zoom: newZoom, shake, shakeX, shakeY };
}

export function addShake(cam: CameraState, amount: number): CameraState {
  return { ...cam, shake: clamp(cam.shake + amount, 0, 1) };
}

/**
 * Build a Transform centred on the camera (with zoom + shake) instead of the
 * full pattern bounds. The canvas only renders what's inside this view.
 */
export function cameraTransform(
  cam: CameraState,
  geo: PatternGeometry,
  width: number,
  height: number,
): {
  scale: number;
  toX: (x: number) => number;
  toY: (y: number) => number;
  toCanvas: (p: Vec2) => [number, number];
  width: number;
  height: number;
} {
  // Base scale fits BASE_VIEW_FT into the smaller canvas dimension.
  const baseScale = Math.min(width, height) / BASE_VIEW_FT;
  const scale = baseScale * cam.zoom;
  const toX = (x: number) => (x - cam.cx) * scale + width / 2 + cam.shakeX;
  const toY = (y: number) => height / 2 - (y - cam.cy) * scale + cam.shakeY;
  return {
    scale,
    toX,
    toY,
    toCanvas: (p) => [toX(p.x), toY(p.y)],
    width,
    height,
  };
}

/* --------------------------------- minimap -------------------------------- */

export interface MinimapParams {
  geo: PatternGeometry;
  player: AircraftState;
  ai: AIActor[];
  cam: CameraState;
  width: number; // minimap px
  height: number;
}

/**
 * Render the minimap: full pattern outline, all traffic, the player, and a
 * viewport rectangle showing what the main camera currently sees.
 */
export function renderMinimap(
  ctx: CanvasRenderingContext2D,
  ox: number, // top-left x on main canvas
  oy: number,
  p: MinimapParams,
) {
  const { geo, player, ai, cam } = p;
  const W = p.width;
  const H = p.height;
  const { minX, maxX, minY, maxY } = geo.bounds;
  const bw = maxX - minX;
  const bh = maxY - minY;
  const s = Math.min(W / bw, H / bh);
  const cxw = (minX + maxX) / 2;
  const cyw = (minY + maxY) / 2;
  const mx = (x: number) => ox + (x - cxw) * s + W / 2;
  const my = (y: number) => oy + H / 2 - (y - cyw) * s;

  ctx.save();
  // Panel background (glassy).
  ctx.fillStyle = "rgba(10,21,48,0.7)";
  roundRect(ctx, ox, oy, W, H, 10);
  ctx.fill();
  ctx.strokeStyle = "rgba(62,146,204,0.35)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Clip to panel.
  ctx.beginPath();
  roundRect(ctx, ox, oy, W, H, 10);
  ctx.clip();

  // Guide path (faint).
  if (geo.guidePath.length > 1) {
    ctx.strokeStyle = "rgba(242,177,52,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mx(geo.guidePath[0].x), my(geo.guidePath[0].y));
    for (let i = 1; i < geo.guidePath.length; i++) {
      ctx.lineTo(mx(geo.guidePath[i].x), my(geo.guidePath[i].y));
    }
    ctx.stroke();
  }

  // Runway.
  const [rax, ray] = [mx(geo.departureEnd.x), my(geo.departureEnd.y)];
  const [rbx, rby] = [mx(geo.threshold.x), my(geo.threshold.y)];
  ctx.strokeStyle = "rgba(234,242,251,0.6)";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(rax, ray);
  ctx.lineTo(rbx, rby);
  ctx.stroke();

  // Camera viewport rectangle (what you currently see).
  const viewHalfW = (W / s) / cam.zoom / 2;
  const viewHalfH = (H / s) / cam.zoom / 2;
  ctx.strokeStyle = "rgba(62,146,204,0.6)";
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.strokeRect(
    mx(cam.cx - viewHalfW),
    my(cam.cy + viewHalfH),
    (viewHalfW * 2) * s,
    (viewHalfH * 2) * s,
  );
  ctx.setLineDash([]);

  // AI traffic.
  for (const a of ai) {
    if (!a.active) continue;
    ctx.fillStyle = a.color;
    ctx.beginPath();
    ctx.arc(mx(a.state.pos.x), my(a.state.pos.y), 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Player (gold, larger, with heading tick).
  const px = mx(player.pos.x);
  const py = my(player.pos.y);
  ctx.fillStyle = "#f2b134";
  ctx.shadowColor = "#f2b134";
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(px, py, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  const rad = (player.headingDeg * Math.PI) / 180;
  ctx.strokeStyle = "#f2b134";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(px + Math.sin(rad) * 7, py - Math.cos(rad) * 7);
  ctx.stroke();

  ctx.restore();
  void dist;
  void lerp;
}

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
