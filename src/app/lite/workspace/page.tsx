"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PenTool, ArrowRight, Save, Check } from "lucide-react";

export default function LiteWorkspacePage() {
  const router = useRouter();
  const [essayText, setEssayText] = useState("");
  const [title, setTitle] = useState("Common App Personal Statement");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedEssay = localStorage.getItem("essayforge_lite_essay");
    if (savedEssay) {
      setEssayText(savedEssay);
    } else {
      const selectedIdea = localStorage.getItem("essayforge_lite_selected_idea");
      if (selectedIdea) {
        try {
          const idea = JSON.parse(selectedIdea);
          setTitle(idea.title || "Common App Essay");
          setEssayText(`Title: ${idea.title}\n\nHook:\n${idea.hook}\n\nDraft:\n`);
        } catch (e) {}
      }
    }
  }, []);

  const handleChange = (text: string) => {
    setEssayText(text);
    localStorage.setItem("essayforge_lite_essay", text);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const wordCount = essayText.split(/\s+/).filter(Boolean).length;
  const isOverLimit = wordCount > 650;

  const handleAnalyze = () => {
    router.push("/lite/feedback");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Step 5 of 6</span>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <PenTool className="h-6 w-6 text-indigo-500" /> Essay Workspace
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> Saved
            </span>
          )}
          <Button
            disabled={!essayText.trim()}
            onClick={handleAnalyze}
            className="h-10 px-5 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md"
          >
            Analyze Draft <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor Card */}
      <Card className="border-border/40">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-bold text-foreground">{title}</CardTitle>
          <Badge
            variant="outline"
            className={`text-xs font-bold ${
              isOverLimit 
                ? "border-red-500 text-red-500 bg-red-500/10" 
                : wordCount >= 500 
                ? "border-emerald-500 text-emerald-500 bg-emerald-500/10" 
                : "border-indigo-500 text-indigo-500"
            }`}
          >
            {wordCount} / 650 words
          </Badge>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-3">
          <Textarea
            rows={18}
            value={essayText}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Type or paste your Common App personal statement here... (Target limit: 650 words)"
            className="text-sm leading-relaxed resize-y font-normal"
          />

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <span>Common App Personal Statement Limit: 250 - 650 words</span>
            {isOverLimit && (
              <span className="text-red-500 font-bold">Over limit by {wordCount - 650} words</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
