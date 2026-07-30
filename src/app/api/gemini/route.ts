import { NextResponse } from "next/server";

// Priority chain per production specification: gemini-2.5-flash -> gemini-2.0-flash
const PRIORITY_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"];

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

    let lastErrorMessage = "";

    for (let i = 0; i < PRIORITY_MODELS.length; i++) {
      const modelId = PRIORITY_MODELS[i];
      const isLastModel = i === PRIORITY_MODELS.length - 1;
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

      const startTime = Date.now();
      const startTimestamp = new Date().toISOString();

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          cache: "no-store",
          signal: AbortSignal.timeout(15000) // 15-second strict interactive timeout per attempt
        });

        const duration = Date.now() - startTime;
        const data = await res.json().catch(() => null);

        if (res.ok && data) {
          const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText) {
            console.log(`[Gemini Log] Model: ${modelId} | Start: ${startTimestamp} | Status: ${res.status} | Duration: ${duration}ms | FallbackTriggered: false`);
            return NextResponse.json({ content: generatedText, choices: [{ message: { content: generatedText } }] });
          }
        }

        const errorMessage = data?.error?.message || `HTTP ${res.status} Error`;
        lastErrorMessage = errorMessage;

        // Fallback ONLY for temporary availability/quota errors: HTTP 429 (Rate Limit) or HTTP 503 (Service Unavailable)
        const isTemporaryError = res.status === 429 || res.status === 503;
        const fallbackTriggered = isTemporaryError && !isLastModel;

        console.log(`[Gemini Log] Model: ${modelId} | Start: ${startTimestamp} | Status: ${res.status} | Duration: ${duration}ms | FallbackTriggered: ${fallbackTriggered}`);

        // Immediately fail on non-retryable errors (HTTP 400 Bad Request, HTTP 404 Not Found, etc.)
        if (!isTemporaryError) {
          return NextResponse.json(
            { error: `Gemini ${modelId} Error (${res.status}): ${errorMessage}` },
            { status: res.status }
          );
        }

        // Short 500ms delay before fallback attempt on 429/503
        if (fallbackTriggered) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (err: any) {
        const duration = Date.now() - startTime;
        const isTimeout = err.name === "AbortError" || err.message?.includes("timeout");
        lastErrorMessage = err.message || "Request timeout";

        const fallbackTriggered = isTimeout && !isLastModel;
        console.log(`[Gemini Log] Model: ${modelId} | Start: ${startTimestamp} | Status: ${isTimeout ? "Timeout (15s)" : "Error"} | Duration: ${duration}ms | FallbackTriggered: ${fallbackTriggered}`);

        if (!isTimeout) {
          return NextResponse.json({ error: `Request Error: ${err.message}` }, { status: 500 });
        }

        if (fallbackTriggered) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    }

    return NextResponse.json(
      { error: lastErrorMessage || "Google Gemini is currently experiencing temporary high demand across models. Please try again in a few seconds!" },
      { status: 503 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to call Gemini API." }, { status: 500 });
  }
}
