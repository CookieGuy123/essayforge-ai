"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { generateDetailedEssayIdeas, DetailedEssayIdea } from "@/lib/aiService";
import { Sparkles, ArrowRight, RefreshCw, PenTool, BookOpen, Lightbulb } from "lucide-react";
import Link from "next/link";

export default function EssayIdeaGeneratorPage() {
  const [promptText, setPromptText] = useState(
    "Common App #1: Some students have a background, identity, interest, or talent that is so meaningful they believe their application would be incomplete without it."
  );

  const [topic, setTopic] = useState("Building open-source tools and robotics tutoring");
  const [ideas, setIdeas] = useState<DetailedEssayIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const commonAppPrompts = [
    "Common App #1: Meaningful background, identity, interest, or talent.",
    "Common App #2: Lessons learned from obstacles or failure.",
    "Common App #3: Reflect on a time when you questioned or challenged a belief.",
    "Common App #4: Reflect on something someone has done for you that has made you happy or thankful.",
    "Common App #5: Discuss an accomplishment, event, or realization that sparked personal growth.",
    "Common App #6: Describe a topic, idea, or concept you find so captivating that it makes you lose all track of time.",
    "Common App #7: Share an essay on any topic of your choice."
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      let profile = null;
      let stories = [];

      try {
        const pSaved = localStorage.getItem("essayforge_profile");
        if (pSaved) profile = JSON.parse(pSaved);

        const sSaved = localStorage.getItem("essayforge_stories");
        if (sSaved) stories = JSON.parse(sSaved);
      } catch (e) {}

      const generated = await generateDetailedEssayIdeas(topic, promptText, profile, stories);
      setIdeas(generated);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to connect to LM Studio. Make sure LM Studio is running on http://127.0.0.1:1234");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEssayFromIdea = (idea: DetailedEssayIdea) => {
    try {
      const initialDraft = `${idea.hook}\n\n[Write body paragraph expanding on ${idea.summary}...]\n\n[Conclude with reflection on ${idea.theme}...]`;
      
      localStorage.setItem("essayforge_current_title", idea.title);
      localStorage.setItem("essayforge_current_prompt", idea.commonAppPrompt || promptText);
      localStorage.setItem("essayforge_current_draft", initialDraft);
    } catch (e) {
      console.error("Failed to create essay project from idea:", e);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <Sparkles className="h-7 w-7 text-purple-500" />
          Essay Idea Generator
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Combine your profile, Story Vault entries, and college application prompts to generate distinct narrative concepts evaluated for originality and cliché risk.
        </p>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-400" />
            Select Application Prompt & Focus Topic
          </CardTitle>
          <CardDescription>Choose a prompt or type a custom topic to brainstorm concepts.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <Label htmlFor="promptSelect">College Essay Prompt</Label>
              <select
                id="promptSelect"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-border/80 bg-card dark:bg-slate-900/90 text-foreground px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs"
              >
                {commonAppPrompts.map((p, idx) => (
                  <option key={idx} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="topic">Focus Topic or Core Interest</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Coding robotics, debate team resilience, family cooking traditions..."
                required
              />
            </div>

            <Button type="submit" disabled={loading} size="lg" className="w-full font-bold shadow-md shadow-primary/20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500">
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Brainstorming Concepts via LM Studio...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2 text-purple-300" />
                  Generate Essay Concepts
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-sm">
          <p className="font-bold">Brainstorming Error</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      )}

      {/* Generated Ideas List */}
      {ideas.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-400" />
            Generated Essay Concepts ({ideas.length})
          </h2>

          <div className="grid grid-cols-1 gap-6">
            {ideas.map((idea, index) => (
              <Card key={index} className="border-border/60 bg-gradient-to-b from-card to-secondary/30">
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-purple-500/30 text-purple-400 font-semibold">
                        Concept #{index + 1}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Theme: {idea.theme}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                        Originality: {idea.originalityScore}/100
                      </Badge>
                      <Badge variant="outline" className="border-indigo-500/30 text-indigo-400">
                        Reflection: {idea.reflectionScore}/100
                      </Badge>
                      <Badge variant={idea.clicheRisk === "Low" ? "success" : "destructive"}>
                        Cliché Risk: {idea.clicheRisk}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-foreground mt-3">{idea.title}</CardTitle>
                  <CardDescription className="text-sm text-foreground/90">{idea.summary}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Why Admissions Officers Will Love This</p>
                    <p className="text-sm text-foreground">{idea.whyItWorks}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-secondary/60 border border-border/40 space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Opening Hook Setup</p>
                    <p className="text-sm italic text-foreground/90">{idea.hook}</p>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button asChild size="lg" onClick={() => handleCreateEssayFromIdea(idea)} className="font-bold shadow-md shadow-primary/20 bg-indigo-600 text-white hover:bg-indigo-500">
                      <Link href="/dashboard/essay-workspace">
                        <PenTool className="h-4 w-4 mr-2" />
                        Create Essay From This Idea <ArrowRight className="h-4 w-4 ml-1.5" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}