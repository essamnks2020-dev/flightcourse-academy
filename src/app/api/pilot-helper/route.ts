import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const SYSTEM_PROMPT = `You are a friendly, knowledgeable CFI (Certified Flight Instructor) helping a flight-simulator student. Answer concisely (under 150 words) in plain English. If asked about something dangerous or illegal, refuse. Always remind that this is for simulation training only. You are part of FlightCourse Academy, a free flight-training website for simulator pilots. Be encouraging, never condescending. Use aviation terms but explain them if the student seems new.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "AI helper is not configured. The site owner needs to set GEMINI_API_KEY.",
        setup: true,
      },
      { status: 503 }
    );
  }

  try {
    const { question } = await req.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ parts: [{ text: question }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 250,
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json(
          { error: "The AI is busy right now. Please try again in a moment." },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: "I couldn't reach the AI. Please try again." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I couldn't generate an answer. Please try rephrasing your question.";

    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
