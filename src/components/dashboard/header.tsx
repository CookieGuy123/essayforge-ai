"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { checkLMStudioStatus, LMStudioStatus } from "@/lib/aiService";
import { Activity, ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const [status, setStatus] = useState<LMStudioStatus>({
    online: false,
    modelName: "Checking...",
    modelsCount: 0
  });
  const [loading, setLoading] = useState(false);

  const refreshStatus = async () => {
    setLoading(true);
    try {
      const res = await checkLMStudioStatus();
      setStatus(res);
    } catch {
      setStatus({ online: false, modelName: "Offline", modelsCount: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-border/40 bg-card/80 dark:bg-slate-950/90 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" prefetch={true} className="hover:opacity-80 transition-opacity">
          <h2 className="text-lg font-bold text-foreground tracking-tight">EssayForge AI Studio</h2>
        </Link>
        <Badge variant="outline" className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          Local Profile Active
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-secondary/80 dark:bg-slate-900/90 border border-border/40 rounded-xl px-3 py-1.5 text-xs">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
              status.online && status.modelLoaded !== false ? 'bg-emerald-400' : 'bg-amber-400'
            } opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              status.online && status.modelLoaded !== false ? 'bg-emerald-500' : 'bg-amber-500'
            }`}></span>
          </span>
          <span className="font-bold text-foreground">
            LM Studio:
          </span>
          <span className={`truncate max-w-[150px] font-semibold ${
            status.online && status.modelLoaded !== false
              ? 'text-emerald-600 dark:text-emerald-400' 
              : 'text-amber-600 dark:text-amber-400'
          }`}>
            {status.online 
              ? (status.modelLoaded === false ? "No Model Loaded" : status.modelName)
              : "Offline (port 1234)"}
          </span>
          <button 
            onClick={refreshStatus} 
            disabled={loading}
            className="hover:text-foreground text-muted-foreground transition-colors ml-1 p-0.5"
            title="Refresh LM Studio Status"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <ThemeToggle />

        <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
          <Link href="/dashboard/lm-studio-status">
            <Activity className="h-3.5 w-3.5 mr-1.5" />
            Diagnostics
          </Link>
        </Button>
      </div>
    </header>
  );
}
