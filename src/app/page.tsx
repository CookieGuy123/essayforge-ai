"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Bot, 
  ShieldCheck, 
  Sparkles, 
  BrainCircuit, 
  Archive, 
  ArrowRight,
  Lock,
  Zap
} from "lucide-react";

export default function WelcomeLandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background/95 to-secondary/30 text-foreground transition-colors">
      {/* Top Navbar */}
      <nav className="h-20 border-b border-border/40 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-40 bg-card/60">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <Bot className="h-6 w-6" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-indigo-600 dark:text-indigo-400">
            EssayForge AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="hidden sm:inline-flex gap-1.5 py-1 px-3 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
            <ShieldCheck className="h-3.5 w-3.5" />
            100% Local & Private
          </Badge>

          <ThemeToggle />

          <Button asChild size="lg" className="shadow-md shadow-primary/20 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl">
            <Link href="/lite">
              Start Common App Essay <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-8">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          Local AI College Admissions Essay Coach
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6 text-foreground">
          Forge College Essays That Stay <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">Uniquely Yours</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
          EssayForge AI runs entirely on your local machine using LM Studio. Discover stories, brainstorm hooks, refine drafts, and analyze rubric scores without giving away your privacy.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Button asChild size="lg" className="h-14 px-8 text-lg font-bold rounded-2xl shadow-xl shadow-primary/25 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
            <Link href="/lite">
              Start Common App Essay <ArrowRight className="ml-2.5 h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full mt-6">
          <Card className="p-2 border-border/40">
            <CardContent className="p-6 space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center mb-4">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">100% Offline Privacy</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connects directly to your local LM Studio instance at <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-indigo-400">http://127.0.0.1:1234</code>. No data is ever sent to cloud servers.
              </p>
            </CardContent>
          </Card>

          <Card className="p-2 border-border/40">
            <CardContent className="p-6 space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-500 flex items-center justify-center mb-4">
                <Archive className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Story Vault & Discovery</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Uncover authentic anecdotes and life experiences, then save them into your personal Story Vault.
              </p>
            </CardContent>
          </Card>

          <Card className="p-2 border-border/40">
            <CardContent className="p-6 space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-500 flex items-center justify-center mb-4">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Admissions Rubric Analyzer</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Evaluate drafts for authenticity, structure, clarity, and voice. Get line-by-line feedback without losing your writing tone.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-1">
        <p>EssayForge AI — Local-First Admissions Essay Coach. Powered by LM Studio at localhost:1234.</p>
        <Link href="/pro" prefetch={true} className="text-[11px] text-muted-foreground/30 hover:text-muted-foreground transition-colors">
          Pro
        </Link>
      </footer>
    </div>
  );
}
