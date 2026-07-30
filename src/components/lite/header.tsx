"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Flame, Settings, Cpu, Sparkles, X, Check } from "lucide-react";

export function LiteHeader() {
  const [provider, setProvider] = useState<"lm-studio" | "gemini">("lm-studio");
  const [geminiKey, setGeminiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const savedProv = localStorage.getItem("essayforge_provider");
    if (savedProv === "gemini" || savedProv === "lm-studio") {
      setProvider(savedProv);
    }
    const savedKey = localStorage.getItem("essayforge_gemini_key");
    if (savedKey) {
      setGeminiKey(savedKey);
    }
  }, []);

  const handleSaveSettings = (newProv: "lm-studio" | "gemini", newKey?: string) => {
    setProvider(newProv);
    localStorage.setItem("essayforge_provider", newProv);
    if (newKey !== undefined) {
      setGeminiKey(newKey);
      localStorage.setItem("essayforge_gemini_key", newKey);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-card/90 backdrop-blur-xl transition-colors">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Lite Badge */}
        <div className="flex items-center gap-3">
          <Link href="/lite" prefetch={true} className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-orange-500 via-amber-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-foreground flex items-center gap-1.5">
                EssayForge <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 font-bold border border-orange-500/20">Lite</span>
              </span>
            </div>
          </Link>
        </div>

        {/* AI Provider Switch & Settings */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/40 bg-secondary/40 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            {provider === "gemini" ? (
              <>
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-amber-500">Gemini AI</span>
              </>
            ) : (
              <>
                <Cpu className="h-3.5 w-3.5 text-orange-500" />
                <span>Local LM Studio</span>
              </>
            )}
            <Settings className="ml-1 h-3 w-3" />
          </button>

          <ThemeToggle />
        </div>
      </div>

      {/* AI Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-card-pop relative">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-orange-500" /> AI Engine Settings
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-muted-foreground hover:text-foreground p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Select Active AI Provider</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSaveSettings("lm-studio")}
                  className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                    provider === "lm-studio"
                      ? "border-orange-500 bg-orange-500/10 text-foreground font-bold"
                      : "border-border/40 hover:bg-secondary/50 text-muted-foreground"
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-xs font-bold text-orange-500">
                    <Cpu className="h-4 w-4" /> Local LM Studio
                  </span>
                  <span className="text-[11px] text-muted-foreground font-normal">100% Offline (localhost:1234)</span>
                </button>

                <button
                  onClick={() => handleSaveSettings("gemini")}
                  className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                    provider === "gemini"
                      ? "border-amber-500 bg-amber-500/10 text-foreground font-bold"
                      : "border-border/40 hover:bg-secondary/50 text-muted-foreground"
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                    <Sparkles className="h-4 w-4" /> Google Gemini AI
                  </span>
                  <span className="text-[11px] text-muted-foreground font-normal">Fast Cloud Inference</span>
                </button>
              </div>
            </div>

            {provider === "gemini" && (
              <div className="space-y-2 pt-2 border-t border-border/40">
                <label className="text-xs font-bold uppercase text-muted-foreground">Gemini API Key</label>
                <Input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => handleSaveSettings("gemini", e.target.value)}
                  placeholder="Paste AI Studio Key (AIzaSy...)"
                  className="h-10 text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  Get your free Gemini API key at <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-orange-500 underline font-semibold">aistudio.google.com</a> or put it in your <code className="bg-muted px-1 py-0.5 rounded text-orange-400">.env.local</code> file as <code className="bg-muted px-1 py-0.5 rounded text-orange-400">GEMINI_API_KEY</code>.
                </p>
              </div>
            )}

            {savedSuccess && (
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold flex items-center justify-center gap-1.5">
                <Check className="h-4 w-4" /> AI Engine Settings Saved!
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={() => setShowSettings(false)} className="h-9 px-5 text-xs font-bold bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl">
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
