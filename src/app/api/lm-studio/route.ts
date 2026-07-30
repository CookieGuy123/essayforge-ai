import { NextResponse } from "next/server";

const LOCAL_ENDPOINTS = [
  process.env.NEXT_PUBLIC_LM_STUDIO_URL || process.env.LM_STUDIO_URL || "http://127.0.0.1:1234/v1",
  "http://127.0.0.1:1234/v1",
  "http://localhost:1234/v1"
];

async function getActiveModel(): Promise<{ endpoint: string; modelId: string | null; isLoaded: boolean }> {
  for (const endpoint of LOCAL_ENDPOINTS) {
    if (!endpoint) continue;
    try {
      const cleanEndpoint = endpoint.replace(/\/+$/, "");
      const res = await fetch(`${cleanEndpoint}/models`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(3000)
      });

      if (res.ok) {
        const data = await res.json();
        const models = data?.data || [];
        if (models.length > 0) {
          return { endpoint: cleanEndpoint, modelId: models[0].id, isLoaded: true };
        }
        return { endpoint: cleanEndpoint, modelId: null, isLoaded: false };
      }
    } catch (e) {
      // try next
    }
  }
  return { endpoint: LOCAL_ENDPOINTS[0], modelId: null, isLoaded: false };
}

export async function GET() {
  const startTime = Date.now();

  for (const endpoint of LOCAL_ENDPOINTS) {
    if (!endpoint) continue;
    try {
      const cleanEndpoint = endpoint.replace(/\/+$/, "");
      const res = await fetch(`${cleanEndpoint}/models`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(3000)
      });

      if (res.ok) {
        const data = await res.json();
        const latency = Date.now() - startTime;
        const models = data?.data || [];
        const isLoaded = models.length > 0;
        const activeModel = isLoaded ? models[0].id : "No Model Loaded into RAM";

        return NextResponse.json({
          online: true,
          modelLoaded: isLoaded,
          modelName: activeModel,
          modelsCount: models.length,
          latencyMs: latency,
          lastRequestTime: new Date().toLocaleTimeString(),
          endpoint: cleanEndpoint,
          warning: !isLoaded ? "LM Studio server is running, but no AI model is loaded into memory! Please click 'Load Model' in LM Studio." : undefined
        });
      }
    } catch (e) {
      // try next
    }
  }

  return NextResponse.json({
    online: false,
    modelLoaded: false,
    modelName: "Offline",
    modelsCount: 0,
    latencyMs: 0,
    error: "LM Studio server is offline. Make sure local server is turned on in LM Studio."
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { endpoint, modelId, isLoaded } = await getActiveModel();

    if (!isLoaded && !body.model) {
      return NextResponse.json(
        { error: "LM Studio server is running, but NO model is currently loaded in memory! Please select and load a model in LM Studio." },
        { status: 400 }
      );
    }

    const payload = {
      model: body.model || modelId || "local-model",
      messages: body.messages || [{ role: "user", content: body.prompt || "" }],
      temperature: body.temperature ?? 0.7,
      max_tokens: body.max_tokens ?? 1200
    };

    let lastErrorMessage = "";

    for (const ep of LOCAL_ENDPOINTS) {
      if (!ep) continue;
      try {
        const cleanEndpoint = ep.replace(/\/+$/, "");
        const res = await fetch(`${cleanEndpoint}/chat/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          cache: "no-store",
          signal: AbortSignal.timeout(120000) // 120-second timeout for local GPU inference
        });

        const responseData = await res.json().catch(() => null);

        if (res.ok && responseData) {
          return NextResponse.json(responseData);
        }

        if (responseData?.error?.message) {
          lastErrorMessage = responseData.error.message;
        } else if (responseData?.message) {
          lastErrorMessage = responseData.message;
        } else {
          lastErrorMessage = `LM Studio returned HTTP ${res.status}`;
        }
      } catch (e: any) {
        lastErrorMessage = e.message || "Failed to communicate with LM Studio endpoint.";
      }
    }

    return NextResponse.json(
      { error: lastErrorMessage || "Could not execute AI completion via LM Studio." },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Invalid request payload." }, { status: 400 });
  }
}
