"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { 
  Bot, 
  User, 
  MessageSquareCode, 
  Archive, 
  Sparkles, 
  PenTool, 
  BrainCircuit,
  ArrowRight,
  ExternalLink
} from "lucide-react";

export function LiteHeader() {
  const pathname = usePathname();

  const steps = [
    { num: 1, name: "Profile", href: "/lite/profile", icon: User },
    { num: 2, name: "Interview", href: "/lite/interview", icon: MessageSquareCode },
    { num: 3, name: "Vault", href: "/lite/vault", icon: Archive },
    { num: 4, name: "Ideas", href: "/lite/ideas", icon: Sparkles },
    { num: 5, name: "Essay", href: "/lite/workspace", icon: PenTool },
    { num: 6, name: "Feedback", href: "/lite/feedback", icon: BrainCircuit },
  ];

  const currentStepIndex = steps.findIndex(s => pathname === s.href);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-card/90 backdrop-blur-xl transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Lite Badge */}
        <div className="flex items-center gap-3">
          <Link href="/lite" prefetch={true} className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-foreground flex items-center gap-1.5">
                EssayForge <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-bold border border-indigo-500/20">Lite</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Step Progress Bar */}
        <nav className="hidden md:flex items-center gap-1 bg-secondary/50 p-1 rounded-2xl border border-border/40">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = pathname === step.href;
            const isCompleted = currentStepIndex > idx;

            return (
              <Link
                key={step.href}
                href={step.href}
                prefetch={true}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm font-bold scale-[1.02]"
                    : isCompleted
                    ? "text-indigo-600 dark:text-indigo-400 hover:bg-secondary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                <span className={`h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isActive ? "bg-white/20 text-white" : isCompleted ? "bg-indigo-500/20 text-indigo-500" : "bg-muted text-muted-foreground"
                }`}>
                  {step.num}
                </span>
                <span>{step.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex text-xs font-medium border-border/40">
            <Link href="/dashboard" prefetch={true}>
              Full App <ExternalLink className="ml-1.5 h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
