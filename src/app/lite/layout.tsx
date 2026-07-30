import React from "react";
import Link from "next/link";
import { LiteHeader } from "@/components/lite/header";

export const metadata = {
  title: "EssayForge Lite — Common App Personal Statement Coach",
  description: "A minimal, 5-step workflow for drafting and perfecting your Common App Personal Statement.",
};

export default function LiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      <LiteHeader />
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 animate-page-enter">
        {children}
      </main>
      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-1">
        <p>EssayForge Lite — Simplified Common App Coach. Powered by Local LM Studio Engine.</p>
        <Link href="/pro" prefetch={true} className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground transition-colors">
          EssayForge Pro
        </Link>
      </footer>
    </div>
  );
}
