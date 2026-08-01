/**
 * Funnel event tracking API.
 *
 * Receives FlightCourse funnel events (flight-start, sequencing-conflict,
 * radio-call-missed, flight-complete, share-tapped, etc.) and records them.
 * In-memory ring buffer + console logging (sufficient for the mini-game suite;
 * swap for Prisma/analytics later without touching the client).
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export interface FunnelEventPayload {
  name: string;
  gameId?: "landing-flare" | "radio-call" | "pattern-perfect";
  sessionId?: string;
  data?: Record<string, unknown>;
  ts?: number;
}

// Module-level ring buffer (survives across requests within a server instance).
const BUFFER_SIZE = 200;
const buffer: FunnelEventPayload[] = [];

export function pushEvent(e: FunnelEventPayload) {
  buffer.push(e);
  if (buffer.length > BUFFER_SIZE) buffer.shift();
}

export function getEvents(): readonly FunnelEventPayload[] {
  return buffer;
}

export async function POST(req: NextRequest) {
  let body: FunnelEventPayload;
  try {
    body = (await req.json()) as FunnelEventPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  if (!body || typeof body.name !== "string") {
    return NextResponse.json({ ok: false, error: "missing name" }, { status: 400 });
  }

  const event: FunnelEventPayload = {
    ...body,
    ts: body.ts ?? Date.now(),
  };

  pushEvent(event);

  console.log(`[funnel] ${event.name}`, {
    gameId: event.gameId,
    sessionId: event.sessionId,
    data: event.data,
  });

  return NextResponse.json({ ok: true, count: buffer.length });
}

export async function GET() {
  const counts: Record<string, number> = {};
  for (const e of buffer) {
    counts[e.name] = (counts[e.name] ?? 0) + 1;
  }
  return NextResponse.json({ ok: true, counts, total: buffer.length });
}
