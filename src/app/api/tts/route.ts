/**
 * TTS API route — generates spoken radio calls on demand with hash-based caching.
 *
 * Radio-call text is combinatorial (callsign × airport × position × altitude ×
 * intent), so pre-generation doesn't cover it. This route:
 *   1. Hashes the exact transmission text.
 *   2. Checks a filesystem cache (.tts-cache/, gitignored) before calling the SDK.
 *   3. On a miss, calls z-ai-web-dev-sdk's audio.tts.create() and caches the WAV.
 *   4. Returns the audio with a long max-age so repeats never re-hit the API.
 *
 * Graceful degradation: if the SDK is unavailable or fails, returns 503 so the
 * client falls back to the existing transmit beep + on-screen text — gameplay is
 * never blocked waiting on network audio.
 */

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import ZAI from "z-ai-web-dev-sdk";

export const dynamic = "force-dynamic";

const CACHE_DIR = path.join(process.cwd(), ".tts-cache");

async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch {
    /* ignore */
  }
}

function hashText(text: string): string {
  return createHash("sha1").update(text).digest("hex").slice(0, 24);
}

export async function POST(req: NextRequest) {
  let body: { text?: string; voice?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const text = body?.text?.trim();
  if (!text || typeof text !== "string" || text.length > 400) {
    return NextResponse.json({ ok: false, error: "missing or invalid text" }, { status: 400 });
  }

  const voice = body.voice && typeof body.voice === "string" ? body.voice : "tongtong";
  const key = hashText(`${voice}|${text}`);
  const cacheFile = path.join(CACHE_DIR, `${key}.wav`);

  await ensureCacheDir();

  // 1. Cache hit?
  try {
    const cached = await fs.readFile(cacheFile);
    return new NextResponse(cached, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-TTS-Cache": "HIT",
      },
    });
  } catch {
    /* miss — continue to generation */
  }

  // 2. Generate via SDK.
  try {
    const zai = await ZAI.create();
    const response = (await zai.audio.tts.create({
      input: text,
      voice,
      speed: 0.95,
      response_format: "wav",
      stream: false,
    })) as Response;

    if (!response || !response.arrayBuffer) {
      throw new Error("TTS returned no audio");
    }
    const arrayBuf = await response.arrayBuffer();
    const buf = Buffer.from(new Uint8Array(arrayBuf));

    // Cache for next time.
    try {
      await fs.writeFile(cacheFile, buf);
    } catch {
      /* cache write failure is non-fatal */
    }

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-TTS-Cache": "MISS",
      },
    });
  } catch (err) {
    // Graceful degradation signal — client falls back to beep + text.
    const message = err instanceof Error ? err.message : "tts failed";
    return NextResponse.json({ ok: false, error: message }, { status: 503 });
  }
}
