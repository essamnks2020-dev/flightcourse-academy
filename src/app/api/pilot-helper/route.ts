import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const SYSTEM_PROMPT = `You are "Copilot" — a friendly, knowledgeable CFI (Certified Flight Instructor) helping a flight-simulator student on FlightCourse Academy. Answer concisely (under 150 words) in plain English. If asked about something dangerous or illegal, refuse. Always remind that this is for simulation training only. Be encouraging, never condescending. Use aviation terms but explain them if the student seems new.`;

/** Onboard CFI answers used when Gemini/Groq keys aren't configured. */
const LOCAL_KB: { match: RegExp; answer: string }[] = [
  {
    match: /approach speed|best approach|vref|1\.3\s*vs/i,
    answer:
      "For a Cessna 172, a solid final approach speed is about 65–70 KIAS with flaps full (around 1.3 × stall). Aim ~65 over the fence, then ease into the flare so you touch near stall. In the sim: stabilize early, don't chase the airspeed with big elevator — small pitch + power. This is for simulation training only.",
  },
  {
    match: /metar|decode.*weather|read a metar/i,
    answer:
      "A METAR is a coded weather snapshot. Example: METAR KSEA 121753Z 18008KT 10SM FEW040 18/10 A2992 — airport, day+time Zulu, wind 180° at 8 kt, 10 statute miles visibility, few clouds at 4,000 ft, temp 18°C / dewpoint 10°C, altimeter 29.92. Read left to right; the wind and visibility tell you if it's a good day to fly the pattern. Sim training only.",
  },
  {
    match: /traffic pattern|pattern entry|how.*pattern/i,
    answer:
      "A traffic pattern is a standard rectangle around the runway: upwind, crosswind, downwind, base, final. Typical light-GA altitude is ~1,000 ft AGL. Enter on a 45° to the downwind, keep turns to the left unless published otherwise, and fly a stable final. Radio calls mark each leg. Practice that geometry in Pattern Perfect — sim training only.",
  },
  {
    match: /vor|vor navigation|how.*vor/i,
    answer:
      "VOR is a ground nav aid that radiates radials 0–359°. Tune the frequency, identify the Morse ID, then twist the OBS to the radial you want. CDI centered + TO/FROM flag tells you where you are relative to the station. Flying TO: center with a TO flag and track that course. Great IFR building block — practice in the sim only.",
  },
  {
    match: /flare|landing.*bounce|round.?out/i,
    answer:
      "Flare is the last pitch-up before touchdown so you arrive level and slow. Start as the runway expands in your vision — ease back, keep eyes down the runway, let airspeed bleed. Ballooning means you pulled too hard; bouncing means you were still fast/flat. Flare Trainer drills exactly that feel. Sim training only.",
  },
  {
    match: /radio|ctaf|unicom|what do i say/i,
    answer:
      "At an untowered field, use CTAF/UNICOM. Basic call: who you are, where you are, what you're doing, which runway. Example: \"Poplar Grove traffic, Cessna 123AB, left downwind runway 30, Poplar Grove.\" Speak clearly, pause, listen. Radio Builder walks you through the phrases. Sim training only.",
  },
  {
    match: /stall|critical angle|vs0|vs1/i,
    answer:
      "A stall is exceeding the critical angle of attack — not \"not enough speed\" alone. Recovery: reduce AoA (lower the nose), add power as appropriate, then level wings and climb out. In the pattern, slow + steep turns are the danger zone. Practice recognition early in the sim. Simulation training only.",
  },
  {
    match: /hello|hi\b|hey\b|who are you|what can you/i,
    answer:
      "Hey — I'm Copilot, your FlightCourse CFI sidekick. Ask me about approach speeds, METARs, traffic patterns, VORs, flares, radio calls, or anything in the 16 modules. Keep it sim-focused and I'll keep answers short and practical.",
  },
];

function localAnswer(question: string): string | null {
  const q = question.trim();
  for (const row of LOCAL_KB) {
    if (row.match.test(q)) return row.answer;
  }
  // Soft keyword fallback for short aviation asks
  const tokens = q.toLowerCase();
  if (/(fly|flight|runway|pilot|aircraft|cessna|ifr|vfr|flap|aileron|rudder)/i.test(tokens)) {
    return "Good question. I don't have a live AI key configured right now, but here's the CFI take: keep it simple — stable airspeed, stable path, then small corrections. Check the matching module in Course for the full lesson, or ask me about approach speed, METARs, patterns, VORs, flares, or radio calls. Sim training only.";
  }
  return null;
}

async function tryGemini(question: string, apiKey: string): Promise<string | null> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: question }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 250 },
      }),
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

async function tryGroq(question: string, apiKey: string): Promise<string | null> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: question },
      ],
      max_tokens: 250,
      temperature: 0.7,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || null;
}

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const providers: {
      name: string;
      key: string;
      fn: (q: string, k: string) => Promise<string | null>;
    }[] = [
      { name: "gemini", key: process.env.GEMINI_API_KEY || "", fn: tryGemini },
      { name: "groq", key: process.env.GROQ_API_KEY || "", fn: tryGroq },
    ];

    for (const provider of providers) {
      if (!provider.key) continue;
      try {
        const answer = await provider.fn(question, provider.key);
        if (answer) {
          return NextResponse.json({ answer, source: provider.name });
        }
      } catch {
        // Try next provider
      }
    }

    const onboard = localAnswer(question);
    if (onboard) {
      return NextResponse.json({ answer: onboard, source: "onboard" });
    }

    return NextResponse.json(
      {
        error:
          "I need a GEMINI_API_KEY or GROQ_API_KEY to answer that. Add one in .env (local) or Vercel env, then ask again — or try a suggested question below.",
      },
      { status: 503 }
    );
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
