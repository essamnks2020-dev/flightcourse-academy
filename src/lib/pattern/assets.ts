/**
 * Illustrated asset loader with hard fallback.
 *
 * Loads pre-generated PNGs from /public/art/ at startup. If any asset is
 * missing, fails to load, or hasn't been generated yet, the renderer falls
 * back to the existing procedural canvas drawing for that element — the game
 * is 100% playable and good-looking with zero generated assets present.
 *
 * This is a progressive-enhancement layer over the procedural renderer, not a
 * hard dependency.
 */

export type AssetKey =
  | "c172-top"
  | "taildragger-top"
  | "lowwing-top"
  | "hero-start";

const PATHS: Record<AssetKey, string> = {
  "c172-top": "/art/c172-top.png",
  "taildragger-top": "/art/taildragger-top.png",
  "lowwing-top": "/art/lowwing-top.png",
  "hero-start": "/art/hero-start.png",
};

const cache = new Map<AssetKey, HTMLImageElement | null>();

/** Load a single asset. Resolves null if the file is missing or fails. */
function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null); // graceful: missing asset → null
    img.src = src;
  });
}

/** Eagerly load all known assets. Safe to call multiple times. */
export async function preloadAssets(): Promise<void> {
  const entries = Object.entries(PATHS) as [AssetKey, string][];
  await Promise.all(
    entries.map(async ([key, src]) => {
      if (cache.has(key)) return;
      const img = await loadImage(src);
      cache.set(key, img);
    }),
  );
}

/** Get a loaded asset, or null if not loaded/missing. */
export function getAsset(key: AssetKey): HTMLImageElement | null {
  return cache.get(key) ?? null;
}

/** Has an asset been successfully loaded? */
export function hasAsset(key: AssetKey): boolean {
  return !!cache.get(key);
}
