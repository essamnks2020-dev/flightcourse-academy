"use client";

import { clamp } from "@/lib/utils";

export interface ShareCardData {
  score: number; // 0..1200
  maxScore: number; // 1200
  streak: number;
  bestStreak: number;
  scenariosCompleted: number;
  totalScenarios: number;
  headline: string; // e.g. "Nailed it!" or "Mayday, received."
  subhead: string;
  mode: "result" | "complete" | "streak";
}

const NAVY = "#0B1D3A";
const NAVY_600 = "#1A3866";
const SKY = "#3E92CC";
const GOLD = "#F2B134";
const LCD = "#5BFF9B";

async function ensureFonts() {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  try {
    await Promise.all([
      document.fonts.load("800 80px Sora"),
      document.fonts.load("700 40px Sora"),
      document.fonts.load("600 28px Inter"),
      document.fonts.load("500 24px Inter"),
      document.fonts.load("700 30px 'JetBrains Mono'"),
    ]);
    await document.fonts.ready;
  } catch {
    /* ignore font load failures — fall back to system fonts */
  }
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

export async function generateShareCard(
  data: ShareCardData,
): Promise<string> {
  const c = document.createElement("canvas");
    c.width = 1080;
    c.height = 1080;
    const ctx = c.getContext("2d");
    if (!ctx) return "";
    await ensureFonts();

    // Background
    const bg = ctx.createLinearGradient(0, 0, 1080, 1080);
    bg.addColorStop(0, NAVY);
    bg.addColorStop(0.55, "#0A1730");
    bg.addColorStop(1, "#081227");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1080, 1080);

    // Glow accents
    const glow1 = ctx.createRadialGradient(860, 120, 0, 860, 120, 520);
    glow1.addColorStop(0, "rgba(62,146,204,0.28)");
    glow1.addColorStop(1, "rgba(62,146,204,0)");
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, 1080, 1080);

    const glow2 = ctx.createRadialGradient(140, 980, 0, 140, 980, 460);
    glow2.addColorStop(0, "rgba(242,177,52,0.16)");
    glow2.addColorStop(1, "rgba(242,177,52,0)");
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, 1080, 1080);

    // Top brand bar
    ctx.fillStyle = SKY;
    ctx.font = "700 30px 'JetBrains Mono', monospace";
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.fillText("FLIGHTCOURSE", 70, 92);
    ctx.fillStyle = "rgba(219,234,246,0.55)";
    ctx.font = "500 22px Inter, sans-serif";
    ctx.fillText("RADIO CALL BUILDER", 70, 122);

    // Brand mark (small plane glyph)
    ctx.save();
    ctx.translate(980, 96);
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(34, -8);
    ctx.lineTo(34, 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = SKY;
    ctx.fillRect(-22, -3, 30, 6);
    ctx.restore();

    // Headline
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "800 76px Sora, sans-serif";
    ctx.textAlign = "left";
    const headline = data.headline.toUpperCase();
    ctx.fillText(headline, 70, 250);

    ctx.fillStyle = "rgba(219,234,246,0.8)";
    ctx.font = "600 30px Inter, sans-serif";
    wrapText(ctx, data.subhead, 70, 300, 940, 38, 2);

    // Score panel
    const panelY = 380;
    roundRect(ctx, 70, panelY, 940, 230, 24);
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fill();
    ctx.strokeStyle = "rgba(62,146,204,0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Score number
    ctx.fillStyle = LCD;
    ctx.shadowColor = "rgba(91,255,155,0.55)";
    ctx.shadowBlur = 22;
    ctx.font = "800 120px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText(`${data.score}`, 110, panelY + 150);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(219,234,246,0.55)";
    ctx.font = "600 34px Inter, sans-serif";
    ctx.fillText(`/ ${data.maxScore}`, 110, panelY + 192);

    ctx.fillStyle = "rgba(219,234,246,0.6)";
    ctx.font = "500 24px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("TOTAL SCORE", 110, panelY + 60);

    // Right side: streak + progress
    const rx = 620;
    ctx.textAlign = "left";
    ctx.fillStyle = GOLD;
    ctx.font = "800 76px Sora, sans-serif";
    ctx.fillText(`${data.streak}`, rx, panelY + 130);
    ctx.fillStyle = "rgba(219,234,246,0.6)";
    ctx.font = "500 22px Inter, sans-serif";
    ctx.fillText("CURRENT STREAK", rx, panelY + 60);

    ctx.fillStyle = "rgba(219,234,246,0.8)";
    ctx.font = "600 26px Inter, sans-serif";
    ctx.fillText(`Best streak: ${data.bestStreak}`, rx, panelY + 168);
    ctx.fillText(
      `${data.scenariosCompleted}/${data.totalScenarios} scenarios`,
      rx,
      panelY + 200,
    );

    // Badge ribbon
    const badgeY = 660;
    ctx.fillStyle = GOLD;
    roundRect(ctx, 70, badgeY, 940, 96, 18);
    ctx.fill();
    ctx.fillStyle = NAVY;
    ctx.font = "800 34px Sora, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      `${data.scenariosCompleted === data.totalScenarios ? "ALL SCENARIOS COMPLETE" : "RADIO CALL BUILDER"}  ·  FAA AIM PHRASEOLOGY`,
      540,
      badgeY + 60,
    );

    // Footer
    ctx.fillStyle = "rgba(219,234,246,0.5)";
    ctx.font = "500 24px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Free ATC phraseology trainer for Cessna 172 students", 70, 880);
    ctx.fillStyle = SKY;
    ctx.font = "700 30px 'JetBrains Mono', monospace";
    ctx.fillText("flightcourse.app/radio", 70, 924);

    ctx.fillStyle = "rgba(219,234,246,0.4)";
    ctx.font = "500 20px Inter, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("Built on AIM 4-2 · 4-3 · 6-3", 1010, 924);

    return c.toDataURL("image/png");
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const words = text.split(" ");
  let line = "";
  let lines = 0;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y + lines * lineHeight);
      line = w;
      lines += 1;
      if (lines >= maxLines - 1) break;
    } else {
      line = test;
    }
  }
  if (lines < maxLines) ctx.fillText(line, x, y + lines * lineHeight);
}

export interface ShareTexts {
  generic: string;
  cfi: string;
}

export function shareTexts(data: ShareCardData): ShareTexts {
  const pct = Math.round(
    clamp(data.score / Math.max(1, data.maxScore), 0, 1) * 100,
  );
  const generic =
    data.scenariosCompleted === data.totalScenarios
      ? `I cleared all ${data.totalScenarios} Radio Call Builder scenarios on FlightCourse (${pct}% of max score, ${data.bestStreak}-scenario best streak). Free FAA phraseology trainer for student pilots.`
      : `Scored ${data.score}/${data.maxScore} with a ${data.streak}-scenario streak on FlightCourse's Radio Call Builder — a free ATC phraseology trainer built on the AIM.`;
  const cfi =
    data.scenariosCompleted === data.totalScenarios
      ? `A free, low-pressure on-ramp I'd recommend before students key a mic: FlightCourse's Radio Call Builder teaches the shape of a correct radio call (FAA AIM phraseology, ${data.totalScenarios} scenarios incl. readbacks). My run: ${pct}% / ${data.bestStreak} best streak.`
      : `For students nervous about the radio: FlightCourse's Radio Call Builder is a free drag-to-build phraseology trainer (FAA AIM-based, with readback challenges). Worth assigning before first towered flights.`;
  return { generic, cfi };
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

export async function shareCard(
  dataUrl: string,
  text: string,
): Promise<"shared" | "downloaded" | "unsupported"> {
  if (typeof navigator === "undefined") return "unsupported";
  try {
    if (navigator.share && navigator.canShare) {
      const blob = await dataUrlToBlob(dataUrl);
      const file = new File([blob], "flightcourse-radio.png", {
        type: "image/png",
      });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text });
        return "shared";
      }
    }
  } catch {
    /* user cancelled or share failed — fall through to download */
  }
  downloadDataUrl(dataUrl);
  return "downloaded";
}

export function downloadDataUrl(dataUrl: string, filename = "flightcourse-radio.png") {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function copyImageToClipboard(dataUrl: string): Promise<boolean> {
  try {
    if (typeof navigator === "undefined" || !navigator.clipboard) return false;
    const ClipboardItemCtor = (
      window as unknown as { ClipboardItem?: typeof ClipboardItem }
    ).ClipboardItem;
    if (!ClipboardItemCtor) return false;
    const blob = await dataUrlToBlob(dataUrl);
    await navigator.clipboard.write([
      new ClipboardItemCtor({ [blob.type]: blob }),
    ]);
    return true;
  } catch {
    return false;
  }
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
