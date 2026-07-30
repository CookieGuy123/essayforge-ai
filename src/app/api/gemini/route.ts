import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, systemPrompt, maxTokens = 900, apiKeyOverride } = body;

    const apiKey =
      apiKeyOverride ||
      body.apiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
      return NextResponse.json(
        { error: "Gemini API key is not configured. Please add GEMINI_API_KEY to your .env.local file or enter it in Settings." },
        { status: 400 }
      );
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            { text: `${systemPrompt || ""}\n\nUser Request:\n${prompt || ""}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: maxTokens
      }
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(45000)
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data) {
      const errMsg = data?.error?.message || `Gemini API returned status ${res.status}`;
      return NextResponse.json({ error: errMsg }, { status: res.status || 400 });
    }

    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      return NextResponse.json({ error: "Gemini returned no text content." }, { status: 400 });
    }

    return NextResponse.json({ content: generatedText, choices: [{ message: { content: generatedText } }] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to call Gemini API." }, { status: 500 });
  }
}
