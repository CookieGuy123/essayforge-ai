"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Bot, 
  ArrowRight, 
  User, 
  MessageSquareCode, 
  Archive, 
  Sparkles, 
  PenTool, 
  BrainCircuit,
  CheckCircle2
} from "lucide-react";

export default function LiteLandingPage() {
  const steps = [
    { num: 1, title: "Student Profile", desc: "Set your target major & goals", icon: User, href: "/lite/profile" },
    { num: 2, title: "AI Story Interview", desc: "Uncover core anecdotes", icon: MessageSquareCode, href: "/lite/interview" },
    { num: 3, title: "Story Vault", desc: "Review saved memories", icon: Archive, href: "/lite/vault" },
    { num: 4, title: "Essay Ideas", desc: "Generate 3 Common App concepts", icon: Sparkles, href: "/lite/ideas" },
    { num: 5, title: "Essay Workspace", desc: "Draft your 650-word essay", icon: PenTool, href: "/lite/workspace" },
    { num: 6, title: "AI Feedback", desc: "Get admissions rubric scores", icon: BrainCircuit, href: "/lite/feedback" },
  ];

  return (
    <div className="py-8 space-y-12 max-w-4xl mx-auto text-center">
      {/* Hero */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
          <Bot className="h-3.5 w-3.5" />
          EssayForge Lite — Minimal MVP
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          Write Your Common App Essay in <span className="text-indigo-600 dark:text-indigo-400">6 Simple Steps</span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          No complicated settings or distraction. A streamlined, linear workflow built exclusively to take you from initial idea to a polished 650-word personal statement.
        </p>

        <div className="pt-4">
          <Button asChild size="lg" className="h-12 px-8 text-base font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-500/25">
            <Link href="/lite/profile">
              Start Common App Essay <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* 6-Step Workflow Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.num} className="border-border/40 hover:border-indigo-500/40 transition-colors">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">
                    Step {s.num}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">{s.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Privacy note */}
      <div className="p-4 rounded-2xl bg-secondary/50 border border-border/40 text-xs text-muted-foreground flex items-center justify-center gap-2 max-w-lg mx-auto">
        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
        <span>Powered by your local LM Studio instance. 100% Private.</span>
      </div>
    </div>
  );
}
