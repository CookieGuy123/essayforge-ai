import { NextResponse } from "next/server";

const CANDIDATE_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro",
  "gemini-3.5-flash"
];

async function getAvailableGeminiModel(apiKey: string): Promise<string[]> {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      const data = await res.json();
      const models = data?.models || [];
      const generateModels = models
        .filter((m: any) => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent"))
        .map((m: any) => m.name.replace(/^models\//, ""));

      if (generateModels.length > 0) {
        return Array.from(new Set([...generateModels, ...CANDIDATE_MODELS]));
      }
    }
  } catch (e) {
    // fallback
  }
  return CANDIDATE_MODELS;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, systemPrompt, maxTokens = 2500, apiKeyOverride } = body;

    const apiKey =
      apiKeyOverride ||
      body.apiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
      return NextResponse.json(
        { error: "Google Gemini API key is missing. Please click Settings ⚙️ in the top header and enter your free Gemini key!" },
        { status: 400 }
      );
    }

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
        maxOutputTokens: Math.max(2500, maxTokens)
      }
    };

    const availableModels = await getAvailableGeminiModel(apiKey);
    let lastErrorMessage = "";

    // Iterate through candidates until one succeeds (handles high demand / rate limits gracefully)
    for (const modelId of availableModels) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          cache: "no-store",
          signal: AbortSignal.timeout(30000)
        });

        const data = await res.json().catch(() => null);

        if (res.ok && data) {
          const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText) {
            return NextResponse.json({ content: generatedText, choices: [{ message: { content: generatedText } }] });
          }
        }

        // If high demand (429/503) or model error, log and failover to next model
        if (data?.error?.message) {
          lastErrorMessage = data.error.message;
        }
      } catch (err: any) {
        lastErrorMessage = err.message || "Request error";
      }
    }

    return NextResponse.json(
      { error: lastErrorMessage || "Google Gemini is currently experiencing temporary high demand across models. Please click Regenerate in a few seconds!" },
      { status: 429 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to call Gemini API." }, { status: 500 });
  }
}
