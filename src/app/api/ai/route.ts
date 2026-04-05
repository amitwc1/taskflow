import { NextRequest, NextResponse } from "next/server";

// OpenAI key is server-only — never exposed to the browser
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 503 }
    );
  }

  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.length > 2000) {
      return NextResponse.json(
        { error: "Invalid prompt" },
        { status: 400 }
      );
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "OpenAI API request failed" },
        { status: res.status }
      );
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({ content });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
