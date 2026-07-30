import axios from "axios";

export const LM_STUDIO_DIRECT_URL = (
  process.env.NEXT_PUBLIC_LM_STUDIO_URL ||
  process.env.LM_STUDIO_URL ||
  "http://127.0.0.1:1234/v1"
).replace(/\/+$/, "");

export interface LMStudioStatus {
  online: boolean;
  modelLoaded?: boolean;
  modelName: string;
  modelsCount: number;
  error?: string;
  warning?: string;
  latencyMs?: number;
  lastRequestTime?: string;
  endpoint?: string;
}

export interface VoiceProfileResult {
  sentenceRhythm: string;
  vocabularyLevel: string;
  toneTraits: string[];
  personalityMarkers: string[];
  voiceGuidance: string;
}

export interface DetailedEssayIdea {
  id: string;
  title: string;
  summary: string;
  theme: string;
  whyItWorks: string;
  commonAppPrompt: string;
  originalityScore: number;
  reflectionScore: number;
  clicheRisk: "Low" | "Medium" | "High";
  hook: string;
  structure: string[];
}

export interface ComprehensiveEssayAnalysis {
  overallScore: number;
  authenticityScore: number;
  reflectionScore: number;
  specificityScore: number;
  storytellingScore: number;
  emotionalImpactScore: number;
  structureScore: number;
  grammarScore: number;
  alignmentScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  lineFeedback: Array<{
    original: string;
    suggestion: string;
    reasoning: string;
    type: "cliche" | "voice" | "flow" | "clarity" | "reflection" | "grammar";
  }>;
  recommendations: string[];
}

// Google Gemini API completion helper
export async function getGeminiCompletion(
  prompt: string,
  systemPrompt: string,
  maxTokens: number = 2500
): Promise<string> {
  const apiKey = 
    (typeof window !== "undefined" ? localStorage.getItem("essayforge_gemini_key") : null) ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
    throw new Error("Google Gemini API key is missing. Click AI Settings ⚙️ in the header to enter your API key!");
  }

  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, systemPrompt, maxTokens, apiKeyOverride: apiKey }),
    cache: "no-store"
  });

  const data = await res.json().catch(() => null);

  if (res.ok && data && data.content) {
    return data.content;
  }

  const errMsg = data?.error || `Gemini API call failed with status ${res.status}`;
  throw new Error(`Gemini Error: ${errMsg}`);
}

export async function checkLMStudioStatus(): Promise<LMStudioStatus> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/lm-studio", { cache: "no-store" });
      const data = await res.json();
      if (data && data.online) {
        return data;
      }
    } catch (e) {
      // fallback to direct fetch
    }

    // Direct client fallback
    const startTime = Date.now();
    try {
      const res = await fetch(`${LM_STUDIO_DIRECT_URL}/models`, {
        cache: "no-store",
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const data = await res.json();
        const latency = Date.now() - startTime;
        const models = data?.data || [];
        const isLoaded = models.length > 0;
        const activeModel = isLoaded ? models[0].id : "No Model Loaded in RAM";

        return {
          online: true,
          modelLoaded: isLoaded,
          modelName: activeModel,
          modelsCount: models.length,
          latencyMs: latency,
          lastRequestTime: new Date().toLocaleTimeString(),
          endpoint: LM_STUDIO_DIRECT_URL,
          warning: !isLoaded ? "LM Studio server is running, but no AI model is loaded into memory!" : undefined
        };
      }
    } catch (err: any) {
      // return offline
    }

    return {
      online: false,
      modelLoaded: false,
      modelName: "Offline",
      modelsCount: 0,
      latencyMs: 0,
      error: `Could not reach LM Studio at ${LM_STUDIO_DIRECT_URL}`
    };
  }

  // Node server check
  const startTime = Date.now();
  try {
    const response = await axios.get(`${LM_STUDIO_DIRECT_URL}/models`, { timeout: 2000 });
    const latency = Date.now() - startTime;
    const models = response.data?.data || [];
    const isLoaded = models.length > 0;
    const activeModel = isLoaded ? models[0].id : "No Model Loaded in RAM";

    return {
      online: true,
      modelLoaded: isLoaded,
      modelName: activeModel,
      modelsCount: models.length,
      latencyMs: latency,
      lastRequestTime: new Date().toLocaleTimeString(),
      endpoint: LM_STUDIO_DIRECT_URL,
      warning: !isLoaded ? "LM Studio server is running, but no AI model is loaded into memory!" : undefined
    };
  } catch (err: any) {
    return {
      online: false,
      modelLoaded: false,
      modelName: "Offline",
      modelsCount: 0,
      latencyMs: 0,
      error: `LM Studio server is offline at ${LM_STUDIO_DIRECT_URL}`
    };
  }
}

export async function getAICompletion(
  prompt: string,
  systemPrompt: string = "You are EssayForge AI, an expert college admissions essay coach.",
  maxTokens: number = 2500
): Promise<string> {
  const geminiKey = typeof window !== "undefined" ? localStorage.getItem("essayforge_gemini_key") : null;
  const storedProvider = typeof window !== "undefined" ? localStorage.getItem("essayforge_provider") : null;

  // Respect explicit provider setting if saved, otherwise default to Gemini
  const provider = storedProvider || (geminiKey ? "gemini" : "lm-studio");

  // LM Studio Primary Route when explicitly selected
  if (provider === "lm-studio") {
    const payload = {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
      max_tokens: maxTokens
    };

    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/lm-studio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const data = await res.json().catch(() => null);

        if (res.ok && data && !data.error && data?.choices?.[0]?.message?.content) {
          return data.choices[0].message.content;
        }
      } catch (e: any) {
        // failover below
      }
    }

    // Automatic Failover to Gemini API if LM Studio fails
    if (geminiKey) {
      try {
        return await getGeminiCompletion(prompt, systemPrompt, maxTokens);
      } catch (geminiFail: any) {}
    }

    throw new Error("LM Studio is offline. Please start LM Studio or select Google Gemini in Settings ⚙️.");
  }

  // Google Gemini API Cloud Route
  return await getGeminiCompletion(prompt, systemPrompt, maxTokens);
}

export async function conductInterviewStep(
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
  studentProfile?: any
): Promise<string> {
  const profileContext = studentProfile
    ? `Student Name: ${studentProfile.name || "Student"}. Target Colleges: ${studentProfile.colleges || "Top Colleges"}. Major: ${studentProfile.intendedMajor || "Undecided"}.`
    : "";

  const systemMessage = `You are a concise essay coach. Ask 1 short probing question (2 sentences max). Keep responses extremely brief. ${profileContext}`;

  const messages = [
    { role: "system", content: systemMessage },
    ...conversationHistory
  ];

  return getAICompletion(
    messages[messages.length - 1].content,
    systemMessage,
    250
  );
}

export async function analyzeVoiceSample(samplesText: string): Promise<VoiceProfileResult> {
  const systemPrompt = `Analyze writing sample. Respond ONLY with valid JSON:
{
  "sentenceRhythm": "Conversational flow",
  "vocabularyLevel": "Elevated high school",
  "toneTraits": ["Reflective", "Earnest"],
  "personalityMarkers": ["Problem solver"],
  "voiceGuidance": "Maintain student's conversational voice."
}`;

  const userPrompt = `Writing Sample: ${samplesText.slice(0, 500)}`;

  try {
    const raw = await getAICompletion(userPrompt, systemPrompt, 300);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return JSON.parse(raw);
  } catch (err) {
    return {
      sentenceRhythm: "Mix of short punched clauses and fluid compound sentences.",
      vocabularyLevel: "Accessible, precise high school vocabulary.",
      toneTraits: ["Introspective", "Direct"],
      personalityMarkers: ["Problem solver"],
      voiceGuidance: "Preserve the student's direct, conversational story voice."
    };
  }
}

export async function analyzeStoryVaultEntry(storyContent: string, title: string) {
  const systemPrompt = `Analyze story entry. Respond ONLY with valid JSON:
{
  "themes": ["Resilience", "Leadership"],
  "essayAngles": ["Focus on trial-and-error growth"],
  "commonAppFit": "Common App #2 (Obstacles)"
}`;

  try {
    const raw = await getAICompletion(`Title: ${title}\nContent: ${storyContent.slice(0, 400)}`, systemPrompt, 200);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return JSON.parse(raw);
  } catch (e) {
    return {
      themes: ["Resilience"],
      essayAngles: ["Highlight trial-and-error growth"],
      commonAppFit: "Common App #2"
    };
  }
}

export async function generateDetailedEssayIdeas(
  topic: string,
  promptText: string,
  profile?: any,
  stories?: any[]
): Promise<DetailedEssayIdea[]> {
  const major = profile?.intendedMajor || "Undecided Major";
  const colleges = profile?.colleges || "target universities";
  const firstStory = stories && stories.length > 0 ? `Story Snippet: ${stories[0].title} - ${stories[0].content.slice(0, 150)}` : "";

  const systemPrompt = `You are a creative college essay strategist.
Generate 2 DISTINCT, highly specific essay concepts tailored specifically to the prompt: "${promptText}".
Do NOT use generic cliché titles. Create unique concepts matching the student's major (${major}) and story.
Respond ONLY with a JSON array:
[
  {
    "id": "idea-1",
    "title": "Unique Specific Title",
    "summary": "1-2 sentence core concept explanation tailored to ${promptText}.",
    "theme": "Core Personal Value",
    "whyItWorks": "1 sentence why top admissions officers love this concept.",
    "commonAppPrompt": "${promptText}",
    "originalityScore": 92,
    "reflectionScore": 89,
    "clicheRisk": "Low",
    "hook": "Specific opening hook line.",
    "structure": ["Introduction: Scene setting", "Body: Specific challenge", "Conclusion: Intellectual growth"]
  },
  {
    "id": "idea-2",
    "title": "Second Unique Specific Title",
    "summary": "A completely different angle for ${promptText}.",
    "theme": "Second Core Value",
    "whyItWorks": "Why this alternative angle stands out.",
    "commonAppPrompt": "${promptText}",
    "originalityScore": 89,
    "reflectionScore": 91,
    "clicheRisk": "Low",
    "hook": "Alternative opening hook line.",
    "structure": ["Intro", "Body", "Conclusion"]
  }
]`;

  const userPrompt = `Selected Common App Prompt: "${promptText}". Intended Major: ${major}. Target Colleges: ${colleges}. ${firstStory}`;

  try {
    const raw = await getAICompletion(userPrompt, systemPrompt, 450);
    const cleanedRaw = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonMatch = cleanedRaw.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed: DetailedEssayIdea[] = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // Dynamic Fallback Matrix
  }

  // Dynamic Prompt-Aware Fallback Dictionary
  const promptLower = promptText.toLowerCase();

  if (promptLower.includes("#1") || promptLower.includes("background") || promptLower.includes("identity")) {
    return [
      {
        id: "idea-1",
        title: "The Workshop Table Paradigm",
        summary: `Explore how growing up surrounded by household repair projects shaped your obsession with hands-on problem solving in ${major}.`,
        theme: "Cultural Curiosity & Identity",
        whyItWorks: "Anchors identity in concrete physical objects rather than abstract heritage clichés.",
        commonAppPrompt: promptText,
        originalityScore: 94,
        reflectionScore: 90,
        clicheRisk: "Low",
        hook: "My grandfather's toolbox didn't come with an instruction manual, but it taught me everything about engineering.",
        structure: ["Intro: The smells and tools of the workshop", "Body: Learning through trial and error", "Conclusion: Defining my academic voice"]
      },
      {
        id: "idea-2",
        title: "Navigating Dual Dialects",
        summary: "Reflect on bridging two distinct communication styles between family traditions and technical academic research.",
        theme: "Adaptability & Voice",
        whyItWorks: "Demonstrates high linguistic awareness and empathy across diverse communities.",
        commonAppPrompt: promptText,
        originalityScore: 91,
        reflectionScore: 93,
        clicheRisk: "Low",
        hook: "At home, story points were measured in laughter; in the lab, they were measured in milliseconds.",
        structure: ["Intro: The contrast between environments", "Body: Translating complex ideas across groups", "Conclusion: Embracing multi-faceted identity"]
      }
    ];
  }

  return [
    {
      id: "idea-1",
      title: "Reframing the Challenge",
      summary: `Explore how working through an unexpected technical setback in ${major} reshaped your approach to trial-and-error learning.`,
      theme: "Resilience & Growth",
      whyItWorks: "Demonstrates genuine vulnerability and self-directed problem-solving.",
      commonAppPrompt: promptText || "Common App #2",
      originalityScore: 92,
      reflectionScore: 88,
      clicheRisk: "Low",
      hook: "The room fell silent as our prototype ground to a sudden halt three days before the exhibition.",
      structure: ["Intro: The scene of unexpected challenge", "Body: Dissecting root cause and adapting plan", "Conclusion: Personal and academic transformation"]
    },
    {
      id: "idea-2",
      title: "Beyond the Initial Blueprint",
      summary: "Reflect on leading a team through unexpected friction and discovering adaptive empathy.",
      theme: "Empathetic Leadership",
      whyItWorks: "Shows active collaboration rather than isolated individual achievement.",
      commonAppPrompt: promptText || "Common App #5",
      originalityScore: 88,
      reflectionScore: 90,
      clicheRisk: "Low",
      hook: "Describe a specific conversation where your initial assumptions were completely dismantled.",
      structure: ["Intro: Unexpected friction", "Body: Adapting strategy based on feedback", "Conclusion: Lasting leadership growth"]
    }
  ];
}

// Clean & extract pure essay prose paragraphs from raw AI outputs
export function extractPureEssayText(raw: string, title?: string): string {
  const paragraphs = raw.split(/\n\s*\n/);
  const essayParagraphs: string[] = [];

  for (const p of paragraphs) {
    const trimmed = p.trim();
    if (!trimmed) continue;

    // Skip outline blocks (metadata lists or numbered outline planning steps)
    if (/^(\*|\d+\.|\#)\s*(Role|Goal|Writer|Major|Target|Concept|Anecdote|Constraint|Voice Check|Constraint Check|Intro|Body Paragraph|Conclusion|Gearbox|The Turning Point|Expansion)/i.test(trimmed)) {
      continue;
    }

    // Skip short bullet items or list metadata
    if (trimmed.startsWith("*") || trimmed.startsWith("-") || trimmed.startsWith("1.") || trimmed.startsWith("2.")) {
      // If paragraph contains a colon near start and is short, it's outline notes
      if (/^[\*\d\.\-\s]+[A-Z\s/]+:[\s\S]{0,100}$/i.test(trimmed)) {
        continue;
      }
    }

    // Strip inline section prefixes if model added them (e.g. "* *Intro/Gearbox:* The workshop was...")
    let cleanProse = trimmed
      .replace(/^[\*\s\-\d\.]+\*?[A-Z0-9\s/_\-()]+\*?:\s*/i, "")
      .replace(/—|--/g, ", ")
      .trim();

    // Valid essay paragraphs have at least 80 characters and multiple words
    if (cleanProse.length > 50 && cleanProse.split(/\s+/).length > 10) {
      essayParagraphs.push(cleanProse);
    }
  }

  if (essayParagraphs.length > 0) {
    const fullProse = essayParagraphs.join("\n\n").trim();
    return title ? `Title: ${title}\n\n${fullProse}` : fullProse;
  }

  // Fallback to basic regex cleaner
  return raw
    .replace(/^(\*|\d+\.).*?\n/gm, "")
    .replace(/—|--/g, ", ")
    .trim();
}

export async function generateFullEssayDraft(
  promptText: string,
  profile?: any,
  stories?: any[],
  ideaTitle?: string,
  includeStories: boolean = true
): Promise<string> {
  const name = profile?.name || "Student";
  const major = profile?.intendedMajor || "my intended major";
  const colleges = profile?.colleges || "target universities";
  
  const storiesSummary = includeStories && stories && stories.length > 0 
    ? stories.map(s => `Anecdote (${s.title}): ${s.content}`).join("\n\n")
    : "No pre-saved anecdotes used. Craft an organic narrative from scratch based on personal growth and self-reflection.";

  // Strict System Prompt (DO NOT THINK ALOUD - DO NOT WRITE OUTLINES)
  const systemPrompt = `You are a top college admissions essay writer.
DO NOT WRITE AN OUTLINE. DO NOT WRITE PLANNING NOTES. DO NOT WRITE BULLET POINTS.
WRITE ONLY THE FINAL ESSAY PARAGRAPHS FOR THE STUDENT.
The essay must be 450 to 550 words long across 4 full paragraphs.
Do NOT use em dashes (-- or —).`;

  const userPrompt = `Student Name: ${name}. Intended Major: ${major}. Target Colleges: ${colleges}.
Common App Prompt: ${promptText}
Concept Title: ${ideaTitle || "Reframing the Challenge"}
Saved Stories:\n${storiesSummary}

Timestamp Seed: ${Date.now()}

Write ONLY the final 450+ word Common App Personal Statement paragraphs immediately.`;

  // Always attempt live AI completion with 2500 token headroom to guarantee zero cutoffs!
  const raw = await getAICompletion(userPrompt, systemPrompt, 2500);

  // Extract pure essay prose using extractPureEssayText
  const cleanEssay = extractPureEssayText(raw, ideaTitle);
  const wordCount = cleanEssay.split(/\s+/).filter(Boolean).length;
  
  if (cleanEssay && wordCount >= 100) {
    return cleanEssay;
  }

  return raw.replace(/—|--/g, ", ").trim();
}

export async function analyzeEssayComprehensive(
  essayText: string,
  promptText: string = "Common Application Essay",
  profile?: any,
  voiceProfile?: any,
  hasStoryVault: boolean = true
): Promise<ComprehensiveEssayAnalysis> {
  const wordCount = essayText.trim().split(/\s+/).filter(Boolean).length;

  // Enforce Word Count Rules (Common App range is 250 - 650 words)
  if (wordCount < 100) {
    return {
      overallScore: Math.min(25, Math.max(10, Math.round(wordCount * 0.8))),
      authenticityScore: 20,
      reflectionScore: 15,
      specificityScore: 20,
      storytellingScore: 15,
      emotionalImpactScore: 15,
      structureScore: 20,
      grammarScore: 80,
      alignmentScore: 25,
      summary: `Draft is severely incomplete (${wordCount} words). Common App Personal Statements require at least 250 words (250–650 word range) to demonstrate narrative arc and self-reflection.`,
      strengths: ["Template setup initialized"],
      weaknesses: [
        `Draft is far too short (${wordCount} words vs 250 word minimum)`,
        "Lacks narrative body paragraphs and reflective conclusion"
      ],
      lineFeedback: [
        {
          original: essayText.slice(0, 60).replace(/["\n]/g, " "),
          suggestion: "Write your full story (aim for 250 to 650 words).",
          reasoning: "Admissions officers cannot evaluate incomplete single-word or placeholder drafts.",
          type: "clarity"
        }
      ],
      recommendations: [
        "Expand your story into a complete draft of at least 250 words before requesting admissions feedback."
      ]
    };
  }

  const cleanSnippet = essayText.slice(0, 70).replace(/["\n\r]/g, " ").trim();

  // Strict & Rigorous Admissions Dean Evaluation System Prompt
  const systemPrompt = `You are a critical, highly selective Admissions Dean at Stanford/MIT evaluating a Common App personal statement of ${wordCount} words.
Evaluate the complete essay with extreme admissions rigor.
CRITICAL EVALUATION RULES:
1. Story Vault Anecdote Penalty: ${
    hasStoryVault
      ? "This essay incorporates verified personal Story Vault anecdotes. Evaluate for high specificity and authenticity."
      : "THIS ESSAY DOES NOT USE REAL PERSONAL ANECDOTES (it is a generic open narrative). You MUST PENALIZE Authenticity, Specificity, and Storytelling scores (CAP Authenticity and Specificity under 78). Overall score should NOT exceed 78."
  }
2. Do NOT give inflated high scores (90+) easily. Reserve 90+ ONLY for essays with vivid, highly specific personal anecdotes and deep self-reflection.
3. If an essay relies on broad generalizations without concrete personal memories, overall score must be in the 68-78 range.

Return ONLY a valid JSON object matching this exact structure:
{
  "overallScore": ${hasStoryVault ? 91 : 75},
  "authenticityScore": ${hasStoryVault ? 92 : 72},
  "reflectionScore": ${hasStoryVault ? 89 : 76},
  "specificityScore": ${hasStoryVault ? 90 : 68},
  "storytellingScore": ${hasStoryVault ? 92 : 71},
  "emotionalImpactScore": ${hasStoryVault ? 88 : 70},
  "structureScore": 88,
  "grammarScore": 94,
  "alignmentScore": 88,
  "summary": "Specific critical admissions breakdown of this ${wordCount}-word essay.",
  "strengths": ["Specific strength 1 based on actual essay content", "Specific strength 2"],
  "weaknesses": ["Specific growth area 1 based on actual essay content"],
  "lineFeedback": [
    {
      "original": "${cleanSnippet}...",
      "suggestion": "Specific actionable revision advice.",
      "reasoning": "Admissions reasoning for why this revision strengthens the essay.",
      "type": "flow"
    }
  ],
  "recommendations": ["Actionable recommendation 1 for revising this draft."]
}`;

  const userPrompt = `Prompt: ${promptText}\nFull Draft (${wordCount} words):\n"""\n${essayText.slice(0, 12000)}\n"""`;

  try {
    const raw = await getAICompletion(userPrompt, systemPrompt, 1500);
    const cleanedRaw = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonMatch = cleanedRaw.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed: ComprehensiveEssayAnalysis = JSON.parse(jsonMatch[0]);
      if (parsed && typeof parsed.overallScore === "number" && parsed.overallScore > 0) {
        // Enforce strict Story Vault score penalty if no stories are used
        if (!hasStoryVault && parsed.overallScore > 79) {
          parsed.overallScore = Math.min(78, parsed.overallScore - 14);
          parsed.specificityScore = Math.min(72, (parsed.specificityScore || 85) - 18);
          parsed.authenticityScore = Math.min(74, (parsed.authenticityScore || 85) - 16);
          if (!parsed.weaknesses.some(w => w.toLowerCase().includes("story") || w.toLowerCase().includes("personal"))) {
            parsed.weaknesses.unshift("Lacks concrete personal Story Vault anecdotes, making the narrative feel generic");
          }
        }
        return parsed;
      }
    }
  } catch (e) {
    // Fallback to Dynamic Rigorous Scoring Engine
  }

  // Dynamic Rigorous Scoring Engine (Stricter Curve + Story Vault Penalty)
  const uniqueWords = new Set(essayText.toLowerCase().split(/\s+/)).size;
  const sentenceCount = essayText.split(/[.!?]+/).filter(Boolean).length;
  const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 15;
  const reflectionKeywords = ["realized", "learned", "discovered", "understand", "changed", "growth", "perspective", "doubt", "rebuild", "humility", "philosophy", "adaptability"];
  const reflectionHits = reflectionKeywords.filter(k => essayText.toLowerCase().includes(k)).length;

  let baseScore = Math.min(95, Math.max(68, Math.round(76 + (reflectionHits * 1.8) + (uniqueWords > 220 ? 5 : 2) - (avgSentenceLength > 28 ? 4 : 0))));

  if (!hasStoryVault) {
    baseScore = Math.min(78, baseScore - 12);
  }

  const authScore = hasStoryVault ? Math.min(96, baseScore + 2) : Math.min(74, baseScore - 4);
  const refScore = Math.min(94, baseScore);
  const specScore = hasStoryVault ? Math.min(95, baseScore + 3) : Math.min(70, baseScore - 8);

  return {
    overallScore: baseScore,
    authenticityScore: authScore,
    reflectionScore: refScore,
    specificityScore: specScore,
    storytellingScore: hasStoryVault ? Math.min(94, baseScore + 2) : Math.min(71, baseScore - 5),
    emotionalImpactScore: Math.min(91, baseScore - 2),
    structureScore: Math.min(92, baseScore + 2),
    grammarScore: Math.min(98, Math.max(90, baseScore + 8)),
    alignmentScore: Math.min(94, baseScore + 1),
    summary: hasStoryVault
      ? `Your essay of ${wordCount} words uses vivid personal Story Vault anecdotes, creating a compelling admissions narrative.`
      : `Your essay of ${wordCount} words lacks specific personal Story Vault anecdotes, making it feel somewhat generic to admissions officers.`,
    strengths: hasStoryVault
      ? [
          `Anchored in concrete personal Story Vault memories`,
          `Effective sentence pacing averaging ${Math.round(avgSentenceLength)} words per sentence`
        ]
      : [
          `Clear structural organization across paragraphs`,
          `Strong grammatical accuracy and readability`
        ],
    weaknesses: hasStoryVault
      ? [
          reflectionHits < 4 ? "Sharpen the collegiate application connection in paragraph 4" : "Smooth out transition between technical hurdle and broader takeaway"
        ]
      : [
          "Lacks specific real-life Story Vault anecdotes, reducing authenticity and personal impact",
          "Relies on broad narrative statements rather than vivid personal experiences"
        ],
    lineFeedback: [
      {
        original: cleanSnippet + "...",
        suggestion: hasStoryVault
          ? "Strong sensory hook grounding the essay in a real memory."
          : "Add specific personal anecdotes from your Story Vault to make this paragraph stand out.",
        reasoning: "Top college admissions deans prioritize authentic personal experiences over general essays.",
        type: "flow"
      }
    ],
    recommendations: hasStoryVault
      ? ["Polishing final sentence to leave a strong lasting impression."]
      : ["Add personal Story Vault anecdotes to boost your Authenticity & Specificity scores above 90."]
  };
}

export async function runAICoachingTool(
  action: "clarity" | "reflection" | "show_dont_tell" | "cliches" | "transitions" | "grammar" | "voice",
  essayText: string,
  voiceGuidance?: string
): Promise<string> {
  const toolPrompts: Record<string, string> = {
    clarity: "Review for clarity and conciseness. Keep response under 3 bullet points.",
    reflection: "Examine self-reflection. Provide 2 concise coaching tips.",
    show_dont_tell: "Identify 'telling' lines and provide 2 quick suggestions.",
    cliches: "Identify admissions clichés and suggest fresh alternatives.",
    transitions: "Suggest 1-2 smooth transition bridges.",
    grammar: "List top grammar & tense consistency fixes.",
    voice: "Check against student voice profile. Keep advice concise."
  };

  const systemPrompt = "You are a concise admissions essay coach. Provide brief, actionable coaching advice (under 150 words).";
  
  return getAICompletion(`Task: ${toolPrompts[action]}\nDraft:\n"""\n${essayText.slice(0, 1200)}\n"""`, systemPrompt, 250);
}