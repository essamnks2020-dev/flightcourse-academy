import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const SYSTEM_PROMPT = `You are "Copilot" — a friendly, knowledgeable CFI (Certified Flight Instructor) helping a flight-simulator student on FlightCourse Academy. Answer concisely (under 150 words) in plain English. Write plain text only: no markdown, no asterisks, no headers, no bold; use short sentences and simple dash lists when needed. If asked about something dangerous or illegal, refuse. Always remind that this is for simulation training only. Be encouraging, never condescending. Use aviation terms but explain them if the student seems new.`;

// Multi-LLM rotation: Gemini models in order, then Groq as a final fallback.
// Model availability varies by API key/project quota, so we walk a chain.
const GEMINI_MODELS = (
  process.env.GEMINI_MODEL ||
  "gemini-flash-latest,gemini-flash-lite-latest"
)
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

async function tryGemini(question: string, apiKey: string, model: string): Promise<string | null> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: question }] }],
        // 2.5-series models spend part of the budget on hidden reasoning
        // tokens, so the cap needs headroom above the ~150-word answer.
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
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

    // Try each Gemini model in order, then Groq
    const geminiKey = process.env.GEMINI_API_KEY || "";
    if (geminiKey) {
      for (const model of GEMINI_MODELS) {
        try {
          const answer = await tryGemini(question, geminiKey, model);
          if (answer) return NextResponse.json({ answer });
        } catch {
          // Try next model
        }
      }
    }

    const groqKey = process.env.GROQ_API_KEY || "";
    if (groqKey) {
      try {
        const answer = await tryGroq(question, groqKey);
        if (answer) return NextResponse.json({ answer });
      } catch {
        // Fall through to the error below
      }
    }

    // All providers failed
    return NextResponse.json(
      { error: "I'm having trouble connecting right now. Please try again in a moment." },
      { status: 503 }
    );
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
