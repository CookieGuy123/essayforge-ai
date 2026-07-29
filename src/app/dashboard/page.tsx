import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Archive, 
  MessageSquareCode, 
  Sparkles, 
  PenTool, 
  BrainCircuit, 
  ArrowRight,
  BookOpen,
  Mic
} from "lucide-react";

export default function Dashboard() {
  const tools = [
    {
      title: "Local Student Profile",
      description: "Set your academic background, target colleges, intended major, and authentic voice preferences.",
      href: "/dashboard/profile",
      icon: User,
      badge: "Step 1",
      color: "from-blue-500/20 to-indigo-500/20 text-blue-500"
    },
    {
      title: "Voice Preservation Studio",
      description: "Analyze your natural writing samples to generate voice directives that protect your authentic tone.",
      href: "/dashboard/voice-profile",
      icon: Mic,
      badge: "Voice",
      color: "from-pink-500/20 to-purple-500/20 text-pink-500",
      highlight: true
    },
    {
      title: "Story Vault",
      description: "Organize key personal stories, anecdotes, and growth experiences to use as raw essay material.",
      href: "/dashboard/story-vault",
      icon: Archive,
      badge: "Step 2",
      color: "from-amber-500/20 to-orange-500/20 text-amber-500"
    },
    {
      title: "AI Story Interviewer",
      description: "Engage in an interactive Q&A session with local AI to uncover forgotten stories and core values.",
      href: "/dashboard/ai-interview",
      icon: MessageSquareCode,
      badge: "Discovery",
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-500"
    },
    {
      title: "Essay Idea Generator",
      description: "Generate tailored essay concepts, structural hooks, and narrative angles using your saved stories.",
      href: "/dashboard/essay-idea-generator",
      icon: Sparkles,
      badge: "Brainstorm",
      color: "from-purple-500/20 to-pink-500/20 text-purple-500"
    },
    {
      title: "Essay Workspace",
      description: "Write and edit your essay with word limit tracking, prompt alignment, and 7 local AI coaching tools.",
      href: "/dashboard/essay-workspace",
      icon: PenTool,
      badge: "Writing",
      color: "from-cyan-500/20 to-blue-500/20 text-cyan-500"
    },
    {
      title: "Essay Analyzer",
      description: "Get comprehensive 8-metric admissions rubric scoring, authenticity checks, and line-by-line coaching.",
      href: "/dashboard/essay-analyzer",
      icon: BrainCircuit,
      badge: "Review & Score",
      color: "from-violet-500/20 to-fuchsia-500/20 text-violet-500",
      highlight: true
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-background border border-indigo-500/20 p-8 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Welcome to EssayForge AI Studio
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Craft authentic, compelling college application essays with zero cloud data sharing. Everything is stored locally on your machine and powered by your local LM Studio instance.
          </p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Profile Status</p>
              <p className="text-lg font-bold text-foreground">Active</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Archive className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Saved Stories</p>
              <p className="text-lg font-bold text-foreground">3 Entries</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <PenTool className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Draft Essays</p>
              <p className="text-lg font-bold text-foreground">2 Saved</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Analyses Run</p>
              <p className="text-lg font-bold text-foreground">Ready</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tools & Features Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-500" />
          Essay Forge Tools
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card key={tool.href} className={`group hover:border-indigo-500/50 transition-all duration-200 ${tool.highlight ? 'border-indigo-500/40 bg-gradient-to-b from-indigo-950/20 to-card' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`h-11 w-11 rounded-2xl bg-gradient-to-tr ${tool.color} flex items-center justify-center border border-border/40`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="text-xs font-semibold">
                      {tool.badge}
                    </Badge>
                  </div>
                  <CardTitle className="group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="leading-relaxed text-xs">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button asChild variant="ghost" className="w-full justify-between hover:bg-indigo-500/10 group-hover:text-indigo-400 font-semibold text-sm">
                    <Link href={tool.href}>
                      Open Tool <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}