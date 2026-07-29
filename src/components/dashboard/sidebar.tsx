"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  User, 
  Archive, 
  MessageSquareCode, 
  Sparkles, 
  Activity, 
  Bot,
  BrainCircuit,
  PenTool,
  Mic
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Local Profile", href: "/dashboard/profile", icon: User },
    { name: "Voice Preservation", href: "/dashboard/voice-profile", icon: Mic, highlight: true },
    { name: "Story Vault", href: "/dashboard/story-vault", icon: Archive },
    { name: "AI Interviewer", href: "/dashboard/ai-interview", icon: MessageSquareCode },
    { name: "Idea Generator", href: "/dashboard/essay-idea-generator", icon: Sparkles },
    { name: "Essay Workspace", href: "/dashboard/essay-workspace", icon: PenTool },
    { name: "Essay Analyzer", href: "/dashboard/essay-analyzer", icon: BrainCircuit, highlight: true },
    { name: "LM Studio Status", href: "/dashboard/lm-studio-status", icon: Activity },
  ];

  return (
    <aside className="w-64 border-r border-border/40 bg-card dark:bg-slate-950 flex flex-col justify-between hidden md:flex shrink-0 min-h-screen transition-colors">
      <div>
        <Link 
          href="/dashboard" 
          prefetch={true}
          className="p-6 border-b border-border/40 flex items-center gap-3 group cursor-pointer hover:bg-secondary/40 transition-colors block"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 shrink-0 group-hover:scale-105 group-hover:rotate-6 transition-all duration-300">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl leading-tight tracking-tight text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500 transition-colors">
                EssayForge AI
              </h1>
              <p className="text-xs text-muted-foreground font-semibold">Local Essay Coach</p>
            </div>
          </div>
        </Link>

        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 ease-out ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-md shadow-indigo-500/30 translate-x-1 scale-[1.01]"
                    : item.highlight
                    ? "text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-500/15 hover:translate-x-1.5 hover:text-indigo-700 dark:hover:text-indigo-300"
                    : "text-muted-foreground font-medium hover:text-foreground hover:bg-secondary/80 hover:translate-x-1.5"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? "text-white" : item.highlight ? "text-indigo-500 dark:text-indigo-400" : "text-muted-foreground group-hover:text-foreground"
                }`} />
                <span className="truncate">{item.name}</span>
                {item.highlight && !isActive && (
                  <span className="ml-auto text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900 transition-colors">
                    Core
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 m-4 rounded-2xl bg-gradient-to-b from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 text-xs text-muted-foreground space-y-2 hover:border-indigo-500/40 transition-all duration-300">
        <div className="flex items-center gap-2 text-foreground font-bold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Local-First Engine
        </div>
        <p className="leading-relaxed text-[11px]">100% Private. No cloud tracking. Powered by your local LM Studio instance.</p>
      </div>
    </aside>
  );
}
