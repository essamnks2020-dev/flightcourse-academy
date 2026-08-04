"use client";

import { useProgress } from "@/lib/progress-store";

/**
 * Game bridge — connects the iframe games (vanilla HTML in /public) with the
 * React shell.
 *
 * Shell → game:  { type: "fc-theme", theme: "dark" | "light" }
 * Game → shell:  { type: "fc-xp", delta: number, source: string }
 * Game → shell:  { type: "fc-ready", game: string }  (requests theme push)
 */

export type GameId = "flare" | "radio" | "pattern";

const MIGRATION_FLAG = "fc-migration-v1";

/** One-time import of the Short Final game's own XP save into the main store. */
export function migrateGameSaves() {
  try {
    if (localStorage.getItem(MIGRATION_FLAG)) return;
    localStorage.setItem(MIGRATION_FLAG, new Date().toISOString());
    const raw = localStorage.getItem("sf_progress");
    if (!raw) return;
    const parsed = JSON.parse(raw) as { xp?: unknown } | null;
    const xp = Math.round(Number(parsed?.xp) || 0);
    if (xp > 0) useProgress.getState().awardGameXP(xp);
  } catch {
    // storage unavailable (private mode) — skip silently
  }
}

function currentTheme(): "dark" | "light" {
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

/**
 * Attach the bridge for one game iframe. Pushes the active theme on load and
 * on every toggle; awards main-store XP when the game posts gains.
 * Returns a cleanup function.
 */
export function attachGameBridge(
  iframe: HTMLIFrameElement | null,
  game: GameId,
): () => void {
  if (!iframe) return () => {};

  const sendTheme = () => {
    try {
      iframe.contentWindow?.postMessage(
        { type: "fc-theme", theme: currentTheme(), game },
        window.location.origin,
      );
    } catch {
      // iframe not reachable yet — the load/ready handlers will retry
    }
  };

  // The load event fires before setLoaded(true) in the shell — send then, and
  // again when the game announces itself ready.
  const onLoad = () => sendTheme();
  iframe.addEventListener("load", onLoad);

  const observer = new MutationObserver(sendTheme);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  const onMessage = (e: MessageEvent) => {
    if (e.origin !== window.location.origin) return;
    if (e.source !== iframe.contentWindow) return;
    const d = e.data as { type?: string; delta?: unknown } | null;
    if (!d || typeof d !== "object" || typeof d.type !== "string") return;
    if (d.type === "fc-ready") {
      sendTheme();
      return;
    }
    if (d.type === "fc-xp") {
      const delta = Math.round(Number(d.delta) || 0);
      if (delta > 0) useProgress.getState().awardGameXP(delta);
    }
  };
  window.addEventListener("message", onMessage);

  sendTheme();

  return () => {
    iframe.removeEventListener("load", onLoad);
    observer.disconnect();
    window.removeEventListener("message", onMessage);
  };
}
