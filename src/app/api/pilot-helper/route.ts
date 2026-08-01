import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const SYSTEM_PROMPT = `You are "Copilot" — a friendly, knowledgeable CFI (Certified Flight Instructor) helping a flight-simulator student on FlightCourse Academy. Answer concisely (under 150 words) in plain English. If asked about something dangerous or illegal, refuse. Always remind that this is for simulation training only. Be encouraging, never condescending. Use aviation terms but explain them if the student seems new.`;

// Multi-LLM rotation: try Gemini first, then Groq, then Cloudflare
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

    // Try each LLM in order until one works
    const providers: { name: string; key: string; fn: (q: string, k: string) => Promise<string | null> }[] = [
      { name: "gemini", key: process.env.GEMINI_API_KEY || "", fn: tryGemini },
      { name: "groq", key: process.env.GROQ_API_KEY || "", fn: tryGroq },
    ];

    for (const provider of providers) {
      if (!provider.key) continue;
      try {
        const answer = await provider.fn(question, provider.key);
        if (answer) {
          return NextResponse.json({ answer });
        }
      } catch {
        // Try next provider
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
