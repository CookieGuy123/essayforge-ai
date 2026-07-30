"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generateDetailedEssayIdeas, DetailedEssayIdea } from "@/lib/aiService";
import { Sparkles, ArrowRight, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

export default function LiteIdeasPage() {
  const router = useRouter();
  const [selectedPrompt, setSelectedPrompt] = useState("Common App #2: Overcoming Obstacles");
  const [ideas, setIdeas] = useState<DetailedEssayIdea[]>([]);
  const [loading, setLoading] = useState(false);

  const commonAppPrompts = [
    "Common App #1: Meaningful Background or Identity",
    "Common App #2: Overcoming Obstacles & Lessons Learned",
    "Common App #3: Challenging a Belief or Idea",
    "Common App #4: Gratitude or Unexpected Impact",
    "Common App #5: Moment of Personal Growth",
    "Common App #6: Captivating Topic or Interest",
    "Common App #7: Open Topic of Choice"
  ];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const localProfile = localStorage.getItem("essayforge_lite_profile");
      const profileObj = localProfile ? JSON.parse(localProfile) : undefined;

      const localStories = localStorage.getItem("essayforge_lite_stories");
      const storiesArr = localStories ? JSON.parse(localStories) : [];

      const result = await generateDetailedEssayIdeas(
        "Common App Personal Statement",
        selectedPrompt,
        profileObj,
        storiesArr
      );
      setIdeas(result);
    } catch (e) {
      // Handled via fallback
    } finally {
      setLoading(false);
    }
  };

  const handleSelectIdea = (idea: DetailedEssayIdea) => {
    localStorage.setItem("essayforge_lite_selected_idea", JSON.stringify(idea));
    router.push("/lite/workspace");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Step 4 of 6</span>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-500" /> Common App Essay Ideas
          </h1>
        </div>
      </div>

      {/* Prompt Selector & Trigger */}
      <Card className="border-border/40">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base">Select Common App Prompt</CardTitle>
          <CardDescription>
            Choose a target prompt and generate 3 tailored essay concepts based on your profile & story vault.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-3">
          <select
            value={selectedPrompt}
            onChange={(e) => setSelectedPrompt(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-border/40 bg-card text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {commonAppPrompts.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <Button
            disabled={loading}
            onClick={handleGenerate}
            className="w-full h-11 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Brainstorming Concepts...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Generate Essay Concepts
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Ideas */}
      {ideas.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">Recommended Concepts</h2>
          <div className="grid grid-cols-1 gap-4">
            {ideas.map((idea, idx) => (
              <Card key={idea.id || idx} className="border-border/40 hover:border-indigo-500/40 transition-colors">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                    {idea.title}
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] font-bold border-indigo-500/30 text-indigo-500">
                    Fit Score: {idea.originalityScore}/100
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 pt-1 space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {idea.summary}
                  </p>

                  <div className="p-2.5 rounded-xl bg-secondary/50 text-xs space-y-1">
                    <p className="font-semibold text-foreground">💡 Why It Works:</p>
                    <p className="text-muted-foreground">{idea.whyItWorks}</p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={() => handleSelectIdea(idea)}
                      className="h-9 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                    >
                      Start Writing This Essay <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
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
