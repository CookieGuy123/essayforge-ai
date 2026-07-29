"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { analyzeVoiceSample, VoiceProfileResult } from "@/lib/aiService";
import { Mic, Sparkles, RefreshCw, CheckCircle2, Volume2, ShieldCheck, Heart } from "lucide-react";

export default function VoiceProfilePage() {
  const [samples, setSamples] = useState(
    "I've always been fascinated by how small mechanical failures reveal deeper truths about engineering. Last summer, when my homemade 3D printer jammed for the fifth time in an hour, I stopped trying to force the filament through. Instead, I took apart the hotend piece by piece. Looking through a magnifying lens, I noticed micro-grooves etched into the thermal barrier tube—a manufacturing defect no software diagnostic would ever catch. That night, I realized that problem-solving isn't just about applying formulas; it's about patient observation."
  );

  const [voiceProfile, setVoiceProfile] = useState<VoiceProfileResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedVoice = localStorage.getItem("essayforge_voice_profile");
      if (savedVoice) setVoiceProfile(JSON.parse(savedVoice));
    } catch (e) {
      console.error("Failed to load voice profile:", e);
    }
  }, []);

  const handleAnalyzeVoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!samples.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await analyzeVoiceSample(samples);
      setVoiceProfile(result);
      localStorage.setItem("essayforge_voice_profile", JSON.stringify(result));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error("Voice analysis error:", err);
      setError(err.message || "Failed to analyze writing voice via LM Studio. Make sure LM Studio is running at http://localhost:1234");
    } font: {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Mic className="h-7 w-7 text-pink-500" />
            Voice Preservation Studio
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Analyze your natural writing samples so local AI tools preserve your authentic tone and avoid generic AI phrasing.
          </p>
        </div>

        {saved && (
          <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 font-semibold text-sm flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> Voice Profile Saved!
          </Badge>
        )}
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-indigo-400" />
            Paste Authentic Writing Sample
          </CardTitle>
          <CardDescription>
            Provide 1-3 paragraphs of your genuine writing (past essays, journal entries, or personal reflection) for voice analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAnalyzeVoice} className="space-y-4">
            <Textarea
              value={samples}
              onChange={(e) => setSamples(e.target.value)}
              placeholder="Paste writing samples here..."
              className="min-h-[160px] p-4 text-sm leading-relaxed"
              required
            />

            <Button
              type="submit"
              disabled={loading || !samples.trim()}
              size="lg"
              className="w-full font-bold shadow-md shadow-pink-500/20 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin text-white" />
                  Analyzing Linguistic Style via LM Studio...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2 text-pink-300" />
                  Analyze Writing Style & Generate Voice Profile
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-sm">
          <p className="font-bold">Voice Analysis Error</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      )}

      {/* Voice Profile Display */}
      {voiceProfile && (
        <Card className="border-pink-500/30 bg-gradient-to-b from-pink-950/20 to-card shadow-lg animate-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-pink-400" />
                Active Voice Profile
              </CardTitle>
              <Badge variant="outline" className="border-pink-500/30 text-pink-300 font-semibold">
                Local Guardrails Enforced
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border/40 space-y-1">
                <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">Sentence Cadence & Rhythm</span>
                <p className="text-sm text-foreground font-medium">{voiceProfile.sentenceRhythm}</p>
              </div>

              <div className="p-4 rounded-2xl bg-secondary/50 border border-border/40 space-y-1">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Vocabulary Level</span>
                <p className="text-sm text-foreground font-medium">{voiceProfile.vocabularyLevel}</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Identified Tone & Character Traits</span>
              <div className="flex flex-wrap gap-2">
                {voiceProfile.toneTraits?.map((trait: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="px-3 py-1 text-xs font-semibold">
                    <Heart className="h-3 w-3 mr-1 text-pink-400" /> {trait}
                  </Badge>
                ))}
                {voiceProfile.personalityMarkers?.map((pm: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="px-3 py-1 text-xs font-semibold border-indigo-500/30 text-indigo-300">
                    {pm}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-pink-500/10 border border-pink-500/30 space-y-1.5">
              <span className="text-xs font-bold text-pink-300 uppercase tracking-wider">AI Coaching Voice Directive</span>
              <p className="text-sm text-foreground leading-relaxed italic">{voiceProfile.voiceGuidance}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
