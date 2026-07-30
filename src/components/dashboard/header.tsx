"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";

export function Header() {
  return (
    <header className="h-16 border-b border-border/40 bg-card/60 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-40 transition-colors">
      <div className="flex items-center gap-4">
        <Link href="/pro" prefetch={true} className="font-extrabold text-lg tracking-tight text-foreground hover:opacity-90 transition-opacity flex items-center gap-2">
          <span>EssayForge</span>
          <Badge variant="outline" className="text-[10px] font-bold border-orange-500/30 text-orange-500 bg-orange-500/10">
            Pro
          </Badge>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
      </div>
    </header>
  );
}
