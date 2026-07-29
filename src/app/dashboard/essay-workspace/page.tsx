"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { runAICoachingTool } from "@/lib/aiService";
import { 
  PenTool, 
  Save, 
  BrainCircuit, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  FileText, 
  Wand2,
  History,
  Mic,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";

interface VersionItem {
  versionNumber: number;
  label: string;
  content: string;
  wordCount: number;
  timestamp: string;
}

export default function EssayWorkspacePage() {
  const [title, setTitle] = useState("Common Application Personal Statement");
  const [prompt, setPrompt] = useState("Common App #1: Meaningful background, identity, interest, or talent.");
  const [targetWordLimit, setTargetWordLimit] = useState(650);
  const [content, setContent] = useState(
    "The metallic clink of a dropped wrench echoed across the quiet garage. It was 1:15 AM, and my autonomous robot arm was supposed to be picking up a chess piece. Instead, its elbow joint trembled once and collapsed.\n\nThree weeks earlier, I had set out to build a low-cost robotic arm to assist disabled students in writing notes during class. On paper, the mathematical kinematics were straightforward. In reality, cheaper motors introduced non-linear friction that my software couldn't predict.\n\nMost people see mechanical failure as a signal to restart. I saw it as a conversation between physics and code. Instead of adding heavier motors, I spent two nights re-deriving the momentum equations and 3D printing custom gear reducers.\n\nWhen the arm finally picked up its first pawn smoothly at 3:00 AM, I didn't just feel excitement—I felt a deep clarity about how I approach problems. Engineering isn't about avoiding mistakes; it's about listening to what the failure is trying to teach you."
  );

  const [versions, setVersions] = useState<VersionItem[]>([
    {
      versionNumber: 1,
      label: "Initial Concept Draft",
      content: "Initial rough draft written during brainstorming.",
      wordCount: 150,
      timestamp: "2026-07-28 10:00 AM"
    }
  ]);

  const [voiceGuidance, setVoiceGuidance] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [aiCoachingLoading, setAiCoachingLoading] = useState(false);
  const [aiCoachResponse, setAiCoachResponse] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedTitle = localStorage.getItem("essayforge_current_title");
      if (savedTitle) setTitle(savedTitle);

      const savedPrompt = localStorage.getItem("essayforge_current_prompt");
      if (savedPrompt) setPrompt(savedPrompt);

      const savedDraft = localStorage.getItem("essayforge_current_draft");
      if (savedDraft) setContent(savedDraft);

      const savedVoice = localStorage.getItem("essayforge_voice_profile");
      if (savedVoice) {
        const parsed = JSON.parse(savedVoice);
        setVoiceGuidance(parsed.voiceGuidance);
      }
    } catch (e) {
      console.error("Failed to load workspace draft:", e);
    }
  }, []);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;
  const isOverLimit = wordCount > targetWordLimit;

  const handleSave = () => {
    localStorage.setItem("essayforge_current_title", title);
    localStorage.setItem("essayforge_current_prompt", prompt);
    localStorage.setItem("essayforge_current_draft", content);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSaveNewVersion = () => {
    const newVer: VersionItem = {
      versionNumber: versions.length + 1,
      label: `Version ${versions.length + 1}`,
      content: content,
      wordCount: wordCount,
      timestamp: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    setVersions([newVer, ...versions]);
    handleSave();
  };

  const handleRestoreVersion = (ver: VersionItem) => {
    setContent(ver.content);
    handleSave();
  };

  const handleRunCoaching = async (
    action: "clarity" | "reflection" | "show_dont_tell" | "cliches" | "transitions" | "grammar" | "voice"
  ) => {
    if (!content.trim() || aiCoachingLoading) return;

    setActiveTool(action);
    setAiCoachingLoading(true);
    setAiCoachResponse(null);

    try {
      const response = await runAICoachingTool(action, content, voiceGuidance || undefined);
      setAiCoachResponse(response);
    } catch (err: any) {
      setAiCoachResponse(`LM Studio Coaching Error: ${err.message || "Ensure LM Studio is running at http://127.0.0.1:1234"}`);
    } finally {
      setAiCoachingLoading(false);
    }
  };

  const coachingTools = [
    { key: "show_dont_tell", label: "Show, Don't Tell", icon: Sparkles, color: "text-amber-500 dark:text-amber-400" },
    { key: "reflection", label: "Add Reflection", icon: Sparkles, color: "text-indigo-600 dark:text-indigo-400" },
    { key: "cliches", label: "Remove Clichés", icon: Sparkles, color: "text-rose-600 dark:text-rose-400" },
    { key: "clarity", label: "Improve Clarity", icon: Sparkles, color: "text-cyan-600 dark:text-cyan-400" },
    { key: "transitions", label: "Improve Transitions", icon: Sparkles, color: "text-purple-600 dark:text-purple-400" },
    { key: "grammar", label: "Fix Grammar", icon: Sparkles, color: "text-emerald-600 dark:text-emerald-400" },
    { key: "voice", label: "Preserve Voice", icon: Mic, color: "text-pink-600 dark:text-pink-400" },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <PenTool className="h-7 w-7 text-cyan-500" />
            Essay Workspace
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Write, save version history, and receive 7 targeted local AI coaching suggestions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saved && (
            <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-3 py-1 font-semibold text-xs flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Saved!
            </Badge>
          )}
          <Button onClick={handleSaveNewVersion} variant="outline" className="font-semibold text-xs">
            <History className="h-3.5 w-3.5 mr-1.5" /> Save Version Snapshot
          </Button>
          <Button onClick={handleSave} variant="outline" className="font-semibold">
            <Save className="h-4 w-4 mr-1.5" /> Save Draft
          </Button>
          <Button asChild className="font-bold shadow-md shadow-primary/20 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
            <Link href="/dashboard/essay-analyzer" onClick={handleSave}>
              <BrainCircuit className="h-4 w-4 mr-1.5" /> Send to Essay Analyzer
            </Link>
          </Button>
        </div>
      </div>

      {voiceGuidance && (
        <div className="p-4 rounded-2xl bg-pink-500/15 border border-pink-500/30 text-xs flex items-center justify-between shadow-xs">
          <span className="flex items-center gap-2 font-bold text-pink-900 dark:text-pink-200">
            <ShieldCheck className="h-4 w-4 text-pink-600 dark:text-pink-400 shrink-0" />
            Voice Profile Active: <span className="font-medium text-pink-800 dark:text-pink-300 italic">{voiceGuidance}</span>
          </span>
          <Button asChild variant="ghost" size="sm" className="h-7 text-xs font-semibold text-pink-700 dark:text-pink-300 hover:text-pink-900 dark:hover:text-pink-100 hover:bg-pink-500/20">
            <Link href="/dashboard/voice-profile">Edit Voice</Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Area */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                <div>
                  <Label htmlFor="essayTitle">Essay Title</Label>
                  <Input
                    id="essayTitle"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="font-semibold"
                  />
                </div>
                <div>
                  <Label htmlFor="wordLimit">Target Word Limit</Label>
                  <select
                    id="wordLimit"
                    value={targetWordLimit}
                    onChange={(e) => setTargetWordLimit(Number(e.target.value))}
                    className="flex h-11 w-full rounded-xl border border-border/80 bg-card dark:bg-slate-900/90 text-foreground px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs"
                  >
                    <option value={650}>650 Words (Common App Personal Statement)</option>
                    <option value={500}>500 Words (Supplemental Essay)</option>
                    <option value={300}>300 Words (Short Answer)</option>
                    <option value={250}>250 Words (UC Personal Insight)</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="prompt">Application Prompt</Label>
                <Input
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="text-xs text-muted-foreground"
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your essay here..."
                className="min-h-[420px] text-base leading-relaxed p-5 font-sans"
              />

              {/* Word Count Indicator */}
              <div className="space-y-2 p-4 rounded-2xl bg-secondary/40 border border-border/40">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-cyan-500" />
                    Word Count: <span className={isOverLimit ? "text-destructive font-bold" : "text-foreground font-bold"}>{wordCount}</span> / {targetWordLimit} words
                  </span>
                  <span className="text-muted-foreground">{charCount} characters</span>
                </div>
                <Progress
                  value={wordCount}
                  max={targetWordLimit}
                  indicatorClassName={isOverLimit ? "bg-destructive" : "bg-cyan-500"}
                />
                {isOverLimit && (
                  <p className="text-xs text-destructive font-medium mt-1">
                    Exceeding limit by {wordCount - targetWordLimit} words. Use AI Coach to trim wordy phrases!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Coaching & Versions Sidebar */}
        <div className="space-y-6">
          <Card className="border-indigo-500/30 bg-gradient-to-b from-indigo-950/20 to-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-indigo-400" />
                AI Coaching Tools
              </CardTitle>
              <CardDescription className="text-xs">
                Targeted coaching suggestions that preserve your authentic voice without auto-replacing text.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 gap-2">
                {coachingTools.map((tool) => {
                  const Icon = tool.icon;
                  const isCurrent = activeTool === tool.key && aiCoachingLoading;
                  return (
                    <Button
                      key={tool.key}
                      onClick={() => handleRunCoaching(tool.key as any)}
                      disabled={aiCoachingLoading}
                      variant="outline"
                      className="w-full justify-start text-xs font-semibold border-indigo-500/30 hover:bg-indigo-500/10"
                    >
                      <Icon className={`h-3.5 w-3.5 mr-2 ${tool.color}`} />
                      {tool.label}
                      {isCurrent && <RefreshCw className="h-3 w-3 ml-auto animate-spin" />}
                    </Button>
                  );
                })}
              </div>

              {aiCoachResponse && (
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-2 mt-4 max-h-[300px] overflow-y-auto">
                  <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Coach Feedback</p>
                  <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">{aiCoachResponse}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Version History Card */}
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4 text-purple-400" />
                Version History ({versions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[220px] overflow-y-auto">
              {versions.map((ver) => (
                <div key={ver.versionNumber} className="p-3 rounded-xl bg-secondary/50 border border-border/40 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-foreground">{ver.label}</p>
                    <p className="text-[11px] text-muted-foreground">{ver.wordCount} words • {ver.timestamp}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleRestoreVersion(ver)} className="h-7 text-xs text-indigo-400">
                    Restore
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}