"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { analyzeEssayComprehensive, ComprehensiveEssayAnalysis } from "@/lib/aiService";
import { 
  BrainCircuit, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  PenTool, 
  ArrowRight,
  Zap,
  Sliders
} from "lucide-react";
import Link from "next/link";

export default function EssayAnalyzerPage() {
  const [promptText, setPromptText] = useState(
    "Common App #1: Meaningful background, identity, interest, or talent."
  );

  const [essayContent, setEssayContent] = useState(
    "The metallic clink of a dropped wrench echoed across the quiet garage. It was 1:15 AM, and my autonomous robot arm was supposed to be picking up a chess piece. Instead, its elbow joint trembled once and collapsed.\n\nThree weeks earlier, I had set out to build a low-cost robotic arm to assist disabled students in writing notes during class. On paper, the mathematical kinematics were straightforward. In reality, cheaper motors introduced non-linear friction that my software couldn't predict.\n\nMost people see mechanical failure as a signal to restart. I saw it as a conversation between physics and code. Instead of adding heavier motors, I spent two nights re-deriving the momentum equations and 3D printing custom gear reducers.\n\nWhen the arm finally picked up its first pawn smoothly at 3:00 AM, I didn't just feel excitement—I felt a deep clarity about how I approach problems. Engineering isn't about avoiding mistakes; it's about listening to what the failure is trying to teach you."
  );

  const [analysis, setAnalysis] = useState<ComprehensiveEssayAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedPrompt = localStorage.getItem("essayforge_current_prompt");
      if (savedPrompt) setPromptText(savedPrompt);

      const savedDraft = localStorage.getItem("essayforge_current_draft");
      if (savedDraft) setEssayContent(savedDraft);
    } catch (e) {
      console.error("Failed to load saved draft for analysis:", e);
    }
  }, []);

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!essayContent.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      let profile = null;
      let voiceProfile = null;
      try {
        const saved = localStorage.getItem("essayforge_profile");
        if (saved) profile = JSON.parse(saved);

        const vSaved = localStorage.getItem("essayforge_voice_profile");
        if (vSaved) voiceProfile = JSON.parse(vSaved);
      } catch (e) {}

      const result = await analyzeEssayComprehensive(essayContent, promptText, profile, voiceProfile);
      setAnalysis(result);
    } catch (err: any) {
      console.error("Essay analysis error:", err);
      setError(err.message || "Failed to analyze essay via LM Studio. Make sure LM Studio is running at http://localhost:1234");
    } finally {
      setLoading(false);
    }
  };

  const wordCount = essayContent.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <BrainCircuit className="h-7 w-7 text-violet-500" />
            Essay Analyzer Studio
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Comprehensive 8-metric admissions rubric evaluation powered 100% locally by LM Studio.
          </p>
        </div>

        <Button asChild variant="outline" className="font-semibold">
          <Link href="/dashboard/essay-workspace">
            <PenTool className="h-4 w-4 mr-2" /> Back to Essay Workspace
          </Link>
        </Button>
      </div>

      {/* Input Section */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sliders className="h-5 w-5 text-indigo-400" />
            Analysis Target & Draft
          </CardTitle>
          <CardDescription>Review or paste the draft text to evaluate against admissions rubrics.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleRunAnalysis} className="space-y-4">
            <div>
              <Label htmlFor="promptInput">Application Prompt</Label>
              <Input
                id="promptInput"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="e.g., Common App Prompt #1"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="essayDraft">Essay Draft Content</Label>
                <span className="text-xs text-muted-foreground font-semibold">{wordCount} Words</span>
              </div>
              <Textarea
                id="essayDraft"
                value={essayContent}
                onChange={(e) => setEssayContent(e.target.value)}
                placeholder="Paste your essay draft here..."
                className="min-h-[200px] font-sans text-sm leading-relaxed p-4"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !essayContent.trim()}
              size="lg"
              className="w-full font-bold shadow-lg shadow-violet-500/20 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 h-13 text-base"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin text-white" />
                  Running 8-Metric Evaluation via LM Studio...
                </>
              ) : (
                <>
                  <BrainCircuit className="h-5 w-5 mr-2 text-violet-200" />
                  Run 8-Metric Admissions Analysis
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-sm">
          <p className="font-bold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> LM Studio Connection Error
          </p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      )}

      {/* Analysis Results Display */}
      {analysis && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Score Summary Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1 border-violet-500/40 bg-gradient-to-br from-violet-950/40 via-card to-card flex flex-col justify-center items-center p-6 text-center">
              <Badge variant="outline" className="border-violet-500/30 text-violet-300 font-semibold mb-3">
                Overall Admissions Fit
              </Badge>
              <div className="relative flex items-center justify-center my-2">
                <div className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-tr from-violet-400 to-indigo-300">
                  {analysis.overallScore}
                </div>
                <span className="text-xl font-bold text-muted-foreground ml-1">/100</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 max-w-xs leading-relaxed">
                Evaluated against competitive university admissions criteria.
              </p>
            </Card>

            {/* 8-Metric Sub-scores */}
            <Card className="md:col-span-2 border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-400" />
                  8 Criteria Evaluation Rubric
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Authenticity</span>
                    <span className="text-indigo-400 font-bold">{analysis.authenticityScore}/100</span>
                  </div>
                  <Progress value={analysis.authenticityScore} indicatorClassName="bg-indigo-500" />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Reflection</span>
                    <span className="text-purple-400 font-bold">{analysis.reflectionScore}/100</span>
                  </div>
                  <Progress value={analysis.reflectionScore} indicatorClassName="bg-purple-500" />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Specificity</span>
                    <span className="text-cyan-400 font-bold">{analysis.specificityScore}/100</span>
                  </div>
                  <Progress value={analysis.specificityScore} indicatorClassName="bg-cyan-500" />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Storytelling Arc</span>
                    <span className="text-pink-400 font-bold">{analysis.storytellingScore}/100</span>
                  </div>
                  <Progress value={analysis.storytellingScore} indicatorClassName="bg-pink-500" />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Emotional Impact</span>
                    <span className="text-rose-400 font-bold">{analysis.emotionalImpactScore}/100</span>
                  </div>
                  <Progress value={analysis.emotionalImpactScore} indicatorClassName="bg-rose-500" />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Structure & Flow</span>
                    <span className="text-blue-400 font-bold">{analysis.structureScore}/100</span>
                  </div>
                  <Progress value={analysis.structureScore} indicatorClassName="bg-blue-500" />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Grammar & Polish</span>
                    <span className="text-teal-400 font-bold">{analysis.grammarScore}/100</span>
                  </div>
                  <Progress value={analysis.grammarScore} indicatorClassName="bg-teal-500" />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Prompt Alignment</span>
                    <span className="text-emerald-400 font-bold">{analysis.alignmentScore}/100</span>
                  </div>
                  <Progress value={analysis.alignmentScore} indicatorClassName="bg-emerald-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Executive Summary */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">Evaluator Summary & Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-foreground bg-secondary/40 p-4 rounded-2xl border border-border/40">
                {analysis.summary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                  <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Core Strengths
                  </h4>
                  <ul className="space-y-1.5 text-xs text-foreground/90 pl-4 list-disc">
                    {analysis.strengths.map((str: string, idx: number) => (
                      <li key={idx}>{str}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <h4 className="font-bold text-sm text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Key Areas for Growth
                  </h4>
                  <ul className="space-y-1.5 text-xs text-foreground/90 pl-4 list-disc">
                    {analysis.weaknesses.map((wk: string, idx: number) => (
                      <li key={idx}>{wk}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line-by-Line Coaching Table */}
          {analysis.lineFeedback && analysis.lineFeedback.length > 0 && (
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Line-by-Line Actionable Feedback</CardTitle>
                <CardDescription>Specific lines evaluated for clichés, voice, reflection, and clarity.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.lineFeedback.map((fb: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-secondary/50 border border-border/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="uppercase text-[10px] tracking-wider font-extrabold text-indigo-400">
                        {fb.type} Observation
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground border-l-2 border-amber-400 pl-3 italic">
                      "{fb.original}"
                    </div>
                    <div className="text-xs text-foreground font-medium">
                      <span className="font-bold text-indigo-400">Coaching Suggestion: </span>
                      {fb.suggestion}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      <span className="font-semibold">Reasoning: </span>{fb.reasoning}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Actionable Next Steps */}
          <Card className="border-indigo-500/30 bg-gradient-to-r from-indigo-950/30 to-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-indigo-400" />
                Actionable Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm text-foreground/90">
                {analysis.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild size="lg" className="w-full font-bold shadow-md shadow-primary/20">
                <Link href="/dashboard/essay-workspace">
                  Apply Changes in Essay Workspace <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
