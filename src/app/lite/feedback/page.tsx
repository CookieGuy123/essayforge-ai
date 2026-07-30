"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { analyzeEssayComprehensive, ComprehensiveEssayAnalysis } from "@/lib/aiService";
import { BrainCircuit, CheckCircle2, AlertCircle, ArrowLeft, Loader2, Sparkles, RefreshCw } from "lucide-react";

export default function LiteFeedbackPage() {
  const [analysis, setAnalysis] = useState<ComprehensiveEssayAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [essayText, setEssayText] = useState("");

  useEffect(() => {
    const text = localStorage.getItem("essayforge_lite_essay") || "";
    setEssayText(text);

    if (!text.trim()) {
      setLoading(false);
      return;
    }

    runAnalysis(text);
  }, []);

  const runAnalysis = async (text: string) => {
    setLoading(true);
    try {
      const localProfile = localStorage.getItem("essayforge_lite_profile");
      const profileObj = localProfile ? JSON.parse(localProfile) : undefined;

      const result = await analyzeEssayComprehensive(text, "Common App Personal Statement", profileObj);
      setAnalysis(result);
    } catch (e) {
      // Fallback handled inside analyzeEssayComprehensive
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Step 6 of 6</span>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-indigo-500" /> Admissions Rubric Feedback
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="h-9 text-xs font-semibold border-border/40">
            <Link href="/lite/workspace">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Edit Essay
            </Link>
          </Button>
          <Button
            disabled={loading || !essayText.trim()}
            onClick={() => runAnalysis(essayText)}
            variant="outline"
            className="h-9 text-xs font-semibold border-border/40"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Re-Analyze
          </Button>
        </div>
      </div>

      {!essayText.trim() ? (
        <Card className="border-border/40 p-8 text-center space-y-3">
          <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
          <h3 className="font-bold text-lg">No Essay Text Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Please write or paste your essay draft in Step 5 (Essay Workspace) before running admissions feedback.
          </p>
          <Button asChild className="bg-indigo-600 text-white font-bold rounded-xl">
            <Link href="/lite/workspace">Go to Essay Workspace</Link>
          </Button>
        </Card>
      ) : loading ? (
        <Card className="border-border/40 p-12 text-center space-y-4">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mx-auto" />
          <div>
            <h3 className="font-bold text-lg text-foreground">Evaluating Common App Essay...</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Analyzing authenticity, self-reflection, structure, and emotional resonance.
            </p>
          </div>
        </Card>
      ) : analysis ? (
        <div className="space-y-6">
          {/* Score Card */}
          <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-card to-card">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center sm:text-left">
                <Badge variant="outline" className="text-xs font-bold border-indigo-500/30 text-indigo-500">
                  Admissions Evaluation
                </Badge>
                <h2 className="text-2xl font-extrabold text-foreground">Overall Admissions Fit</h2>
                <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
                  {analysis.summary}
                </p>
              </div>
              <div className="flex flex-col items-center justify-center h-24 w-24 rounded-full bg-indigo-600 text-white font-extrabold text-3xl shadow-lg shrink-0 border-4 border-indigo-400/30">
                {analysis.overallScore}
                <span className="text-[10px] font-semibold opacity-80 uppercase tracking-widest">/ 100</span>
              </div>
            </CardContent>
          </Card>

          {/* Strengths & Growth Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Core Strengths
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2">
                {analysis.strengths.map((str, i) => (
                  <div key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{str}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" /> Areas for Reflection
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2">
                {analysis.weaknesses.map((wk, i) => (
                  <div key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{wk}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Line Coaching */}
          {analysis.lineFeedback && analysis.lineFeedback.length > 0 && (
            <Card className="border-border/40">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base font-bold">Line-by-Line Coaching Feedback</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-3">
                {analysis.lineFeedback.map((fb, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-secondary/50 border border-border/40 space-y-1.5 text-xs">
                    <p className="font-medium italic text-muted-foreground border-l-2 border-indigo-500 pl-2">
                      "{fb.original}"
                    </p>
                    <p className="font-bold text-foreground">💡 Coaching Tip: {fb.suggestion}</p>
                    <p className="text-muted-foreground">{fb.reasoning}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}
    </div>
  );
}
