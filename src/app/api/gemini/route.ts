import { NextResponse } from "next/server";

const FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-3.5-flash"
];

async function getAvailableGeminiModel(apiKey: string): Promise<string> {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok) {
      const data = await res.json();
      const models = data?.models || [];
      const generateModels = models.filter((m: any) => 
        m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")
      );

      // Pick best matching model (prefer flash/pro)
      const flashModel = generateModels.find((m: any) => m.name.includes("flash"));
      if (flashModel) return flashModel.name.replace(/^models\//, "");
      
      if (generateModels.length > 0) return generateModels[0].name.replace(/^models\//, "");
    }
  } catch (e) {
    // fallback below
  }
  return FALLBACK_MODELS[0];
}

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
        maxOutputTokens: maxTokens
      }
    };

    let lastErrorMessage = "";

    // Step 1: Query API to dynamically discover available active models for this key
    const activeModelName = await getAvailableGeminiModel(apiKey);
    const candidateModels = [activeModelName, ...FALLBACK_MODELS];
    const uniqueCandidates = Array.from(new Set(candidateModels));

    // Step 2: Try candidate endpoints
    for (const modelId of uniqueCandidates) {
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

        if (data?.error?.message) {
          lastErrorMessage = data.error.message;
        }
      } catch (err: any) {
        lastErrorMessage = err.message || "Failed request";
      }
    }

    return NextResponse.json({ error: lastErrorMessage || "Could not generate content from Gemini API." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to call Gemini API." }, { status: 500 });
  }
}
