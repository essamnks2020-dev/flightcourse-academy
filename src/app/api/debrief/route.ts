/**
 * AI CFI debrief API — generates a readable, personalized post-flight debrief.
 *
 * GROUNDING CONSTRAINT (critical): the model is fed the REAL computed
 * FlightResult/checkpoint data as structured input and instructed to ONLY
 * reference and explain those numbers — never invent a score, a cause, or a
 * fact not present in the payload. The deterministic buildWhy() string is the
 * guaranteed fallback if this call fails.
 *
 * Uses z-ai-web-dev-sdk chat completions (server-side only).
 */

import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const dynamic = "force-dynamic";

interface DebriefInput {
  totalScore: number;
  grade: string;
  flightTimeSec: number;
  conflicts: number;
  nearMiss: boolean;
  goAroundRecovered: boolean;
  completedPattern: boolean;
  airport: string;
  difficulty: string;
  checkpoints: { label: string; category: string; score: number; detail: string; passed: boolean }[];
  radioCalls: { position: string; correct: boolean; banned: boolean }[];
}

const SYSTEM_PROMPT = `You are a concise, encouraging Certificated Flight Instructor (CFI) debriefing a student after a traffic-pattern practice flight in a simulator.

ABSOLUTE GROUNDING RULES:
- You may ONLY reference the exact numbers and facts provided in the flight data. Never invent a score, a checkpoint, a radio call, a cause, or a fact that is not in the data.
- Do not speculate about things the data doesn't show (weather details, specific aircraft performance, etc.).
- If the data shows a go-around was executed, acknowledge it as a good recovery.
- Keep it to 3-4 short sentences. Talk like a real CFI: direct, specific, a little warm, no corporate jargon.
- End with one concrete next-step focus for the next flight, derived from the weakest checkpoint shown in the data.
- Do not use bullet points or headers. Plain prose.`;

export async function POST(req: NextRequest) {
  let body: DebriefInput;
  try {
    body = (await req.json()) as DebriefInput;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  if (!body || typeof body.totalScore !== "number") {
    return NextResponse.json({ ok: false, error: "missing flight data" }, { status: 400 });
  }

  // Build a compact, factual data payload for the model — only real numbers.
  const weakest = [...body.checkpoints].sort((a, b) => a.score - b.score)[0];
  const wrongRadios = body.radioCalls.filter((r) => !r.correct);
  const dataPayload = {
    score: body.totalScore,
    grade: body.grade,
    airport: body.airport,
    difficulty: body.difficulty,
    flightTimeSec: Math.round(body.flightTimeSec),
    completedPattern: body.completedPattern,
    conflicts: body.conflicts,
    nearMiss: body.nearMiss,
    goAroundRecovered: body.goAroundRecovered,
    radioSummary: `${body.radioCalls.length - wrongRadios.length}/${body.radioCalls.length} correct`,
    wrongRadioPositions: wrongRadios.map((r) => r.position),
    bannedPhraseUsed: body.radioCalls.some((r) => r.banned),
    weakestCheckpoint: weakest ? { label: weakest.label, score: Math.round(weakest.score), detail: weakest.detail } : null,
    checkpoints: body.checkpoints.map((c) => ({ label: c.label, score: Math.round(c.score), passed: c.passed })),
  };

  try {
    const zai = await ZAI.create();
    const response = await zai.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content:
            `Debrief this flight. Data (use ONLY these facts):\n${JSON.stringify(dataPayload, null, 2)}\n\nWrite the debrief now.`,
        },
      ],
    });
    const debrief =
      response?.choices?.[0]?.message?.content?.trim() ||
      "";
    if (!debrief) throw new Error("empty response");
    return NextResponse.json({ ok: true, debrief });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "debrief failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 503 });
  }
}
