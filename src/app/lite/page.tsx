"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  generateDetailedEssayIdeas, 
  analyzeEssayComprehensive, 
  generateFullEssayDraft,
  DetailedEssayIdea, 
  ComprehensiveEssayAnalysis 
} from "@/lib/aiService";
import { 
  User, 
  Archive, 
  Sparkles, 
  PenTool, 
  BrainCircuit, 
  ArrowRight, 
  ArrowLeft,
  Check, 
  Loader2, 
  BookOpen,
  Trash2,
  RotateCcw,
  Mic,
  MicOff,
  Wand2,
  FileText,
  AlertCircle,
  HelpCircle,
  Lightbulb,
  PlusCircle
} from "lucide-react";

export default function LiteWizardPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1 State: Profile
  const [profile, setProfile] = useState({ name: "", intendedMajor: "", colleges: "" });

  // Step 2 State: Story Vault & Voice-to-Text
  const [vaultStories, setVaultStories] = useState<Array<{ id: string; title: string; content: string }>>([]);
  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [newStoryContent, setNewStoryContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState("");

  // Step 3 State: Ideas
  const [selectedPrompt, setSelectedPrompt] = useState("Common App #2: Overcoming Obstacles");
  const [ideas, setIdeas] = useState<DetailedEssayIdea[]>([]);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [selectedIdeaTitle, setSelectedIdeaTitle] = useState("");

  // Step 4 State: Dual Independent Draft Workspaces
  const [draftWithStories, setDraftWithStories] = useState("");
  const [draftWithoutStories, setDraftWithoutStories] = useState("");
  const [useStoriesOption, setUseStoriesOption] = useState(true);
  const [autoDraftLoading, setAutoDraftLoading] = useState(false);
  const [aiErrorMsg, setAiErrorMsg] = useState("");

  // Active Draft Text in Editor
  const essayText = useStoriesOption ? draftWithStories : draftWithoutStories;

  // Step 5 State: Dual Feedback Workspaces
  const [feedbackWithStories, setFeedbackWithStories] = useState<ComprehensiveEssayAnalysis | null>(null);
  const [feedbackWithoutStories, setFeedbackWithoutStories] = useState<ComprehensiveEssayAnalysis | null>(null);
  const [activeFeedbackTab, setActiveFeedbackTab] = useState<"with" | "without">("with");
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // Active Feedback Object
  const currentFeedback = activeFeedbackTab === "with" ? feedbackWithStories : feedbackWithoutStories;

  // Initialize from LocalStorage
  useEffect(() => {
    const savedProf = localStorage.getItem("essayforge_lite_profile");
    if (savedProf) {
      try { setProfile(JSON.parse(savedProf)); } catch (e) {}
    }
    const savedStories = localStorage.getItem("essayforge_lite_stories");
    if (savedStories) {
      try { setVaultStories(JSON.parse(savedStories)); } catch (e) {}
    } else {
      const defaultStory = [
        {
          id: "1",
          title: "Overcoming Robot Sensor Malfunction",
          content: "During regionals, our robot's optical sensor failed. Instead of giving up, I rewrote the autonomous loop to rely on wheel encoder counts in 15 minutes."
        }
      ];
      setVaultStories(defaultStory);
      localStorage.setItem("essayforge_lite_stories", JSON.stringify(defaultStory));
    }

    const savedWithStories = localStorage.getItem("essayforge_lite_essay_with_stories") || localStorage.getItem("essayforge_lite_essay");
    if (savedWithStories) {
      setDraftWithStories(savedWithStories);
    }
    const savedWithoutStories = localStorage.getItem("essayforge_lite_essay_without_stories");
    if (savedWithoutStories) {
      setDraftWithoutStories(savedWithoutStories);
    }
  }, []);

  // Automatic Grading Trigger whenever switching to Step 5
  useEffect(() => {
    if (currentStep === 5 && !feedbackLoading && (!feedbackWithStories || !feedbackWithoutStories)) {
      handleRunFeedback();
    }
  }, [currentStep]);

  // Voice-to-Text Speech Recognition (Story Vault)
  const handleToggleVoiceDictation = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError("Browser dictation is not supported in this browser. Try Chrome or Edge!");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecording(true);
        setSpeechError("");
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setNewStoryContent((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = (event: any) => {
        setSpeechError(`Voice dictation note: ${event.error}`);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (e: any) {
      setSpeechError("Could not access microphone.");
      setIsRecording(false);
    }
  };

  // Save profile changes
  const updateProfile = (field: string, val: string) => {
    const updated = { ...profile, [field]: val };
    setProfile(updated);
    localStorage.setItem("essayforge_lite_profile", JSON.stringify(updated));
  };

  const handleAddVaultEntry = () => {
    if (!newStoryTitle.trim() || !newStoryContent.trim()) return;
    const newEntry = { id: Date.now().toString(), title: newStoryTitle.trim(), content: newStoryContent.trim() };
    const updated = [newEntry, ...vaultStories];
    setVaultStories(updated);
    localStorage.setItem("essayforge_lite_stories", JSON.stringify(updated));
    setNewStoryTitle("");
    setNewStoryContent("");
  };

  // Preset Story Starters (1-click helper for users with no stories)
  const handleAddPresetStory = (title: string, content: string) => {
    const newEntry = { id: Date.now().toString(), title, content };
    const updated = [newEntry, ...vaultStories];
    setVaultStories(updated);
    localStorage.setItem("essayforge_lite_stories", JSON.stringify(updated));
  };

  // Ideas Generator
  const handleGenerateIdeas = async () => {
    setIdeasLoading(true);
    try {
      const res = await generateDetailedEssayIdeas("Common App Statement", selectedPrompt, profile, vaultStories);
      setIdeas(res);
    } catch (e) {
      // Fallback in aiService
    } finally {
      setIdeasLoading(false);
    }
  };

  const handleSelectIdea = async (idea: DetailedEssayIdea) => {
    setSelectedIdeaTitle(idea.title);
    setCurrentStep(4);
    setAiErrorMsg("");

    // Auto-generate draft with stories if empty
    if (!draftWithStories.trim()) {
      setAutoDraftLoading(true);
      try {
        const draft = await generateFullEssayDraft(selectedPrompt, profile, vaultStories, idea.title, true);
        setDraftWithStories(draft);
        localStorage.setItem("essayforge_lite_essay_with_stories", draft);
        localStorage.setItem("essayforge_lite_essay", draft);
      } catch (e: any) {
        setAiErrorMsg(e.message || "Could not generate essay draft. Please check your AI connection!");
      } finally {
        setAutoDraftLoading(false);
      }
    }
  };

  // Pure Tab Switching (NEVER auto-generates AI on tab click so user has 100% manual control)
  const handleSwitchDraftTab = (withStories: boolean) => {
    setUseStoriesOption(withStories);
    setAiErrorMsg("");
  };

  // Explicit AI Generation / Regeneration Action (Triggered ONLY by clicking "Generate AI Draft")
  const handleGenerateOrRegenerateDraft = async () => {
    setAutoDraftLoading(true);
    setAiErrorMsg("");
    try {
      const draft = await generateFullEssayDraft(selectedPrompt, profile, vaultStories, selectedIdeaTitle, useStoriesOption);
      if (useStoriesOption) {
        setDraftWithStories(draft);
        localStorage.setItem("essayforge_lite_essay_with_stories", draft);
        localStorage.setItem("essayforge_lite_essay", draft);
      } else {
        setDraftWithoutStories(draft);
        localStorage.setItem("essayforge_lite_essay_without_stories", draft);
      }
    } catch (e: any) {
      setAiErrorMsg(e.message || "AI Engine is offline. Click Settings ⚙️ in top header to add your Google Gemini API key!");
    } finally {
      setAutoDraftLoading(false);
    }
  };

  const handleUpdateEssayText = (val: string) => {
    if (useStoriesOption) {
      setDraftWithStories(val);
      localStorage.setItem("essayforge_lite_essay_with_stories", val);
      localStorage.setItem("essayforge_lite_essay", val);
    } else {
      setDraftWithoutStories(val);
      localStorage.setItem("essayforge_lite_essay_without_stories", val);
    }
  };

  // Automatic & Manual Parallel Feedback Generator (Passes hasStoryVault boolean parameter)
  const handleRunFeedback = async () => {
    setFeedbackLoading(true);
    setCurrentStep(5);
    setActiveFeedbackTab(useStoriesOption ? "with" : "without");

    try {
      const promises: Promise<void>[] = [];

      if (draftWithStories.trim()) {
        promises.push(
          analyzeEssayComprehensive(draftWithStories, selectedPrompt, profile, undefined, true)
            .then(res => setFeedbackWithStories(res))
            .catch(() => {})
        );
      }

      if (draftWithoutStories.trim()) {
        promises.push(
          analyzeEssayComprehensive(draftWithoutStories, selectedPrompt, profile, undefined, false)
            .then(res => setFeedbackWithoutStories(res))
            .catch(() => {})
        );
      }

      await Promise.all(promises);
    } catch (e) {
      // Fallback
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Reset essay draft & concepts for a New Essay while preserving Profile & Story Vault
  const handleStartNewEssay = () => {
    setDraftWithStories("");
    setDraftWithoutStories("");
    setIdeas([]);
    setFeedbackWithStories(null);
    setFeedbackWithoutStories(null);
    setSelectedIdeaTitle("");
    setAiErrorMsg("");
    localStorage.removeItem("essayforge_lite_essay");
    localStorage.removeItem("essayforge_lite_essay_with_stories");
    localStorage.removeItem("essayforge_lite_essay_without_stories");
    localStorage.removeItem("essayforge_lite_selected_idea");
    setCurrentStep(3);
  };

  const stepsList = [
    { num: 1, name: "Profile", icon: User },
    { num: 2, name: "Story Vault", icon: Archive },
    { num: 3, name: "Ideas", icon: Sparkles },
    { num: 4, name: "Write Essay", icon: PenTool },
    { num: 5, name: "AI Feedback", icon: BrainCircuit },
  ];

  const wordCount = essayText.split(/\s+/).filter(Boolean).length;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Step Bar Navigation */}
      <div className="w-full max-w-4xl mb-6">
        <div className="flex items-center justify-between bg-card p-2 rounded-2xl border border-border/40 shadow-xs">
          {stepsList.map((step) => {
            const isActive = currentStep === step.num;
            const isDone = currentStep > step.num;

            return (
              <button
                key={step.num}
                onClick={() => setCurrentStep(step.num)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-orange-500 via-amber-500 to-red-600 text-white shadow-md scale-[1.02]"
                    : isDone
                    ? "text-orange-500 bg-orange-500/10 hover:bg-orange-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[11px] ${
                  isActive ? "bg-white/20 text-white" : isDone ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {isDone ? <Check className="h-3 w-3 stroke-[3]" /> : step.num}
                </span>
                <span className="hidden sm:inline">{step.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Wizard Content Card */}
      <div className="w-full max-w-4xl flex-1 flex flex-col">
        {/* STEP 1: PROFILE */}
        {currentStep === 1 && (
          <Card className="border-border/40 shadow-sm animate-card-pop">
            <CardHeader className="p-6 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <Badge className="w-fit bg-orange-500/10 text-orange-500 border-orange-500/20 font-bold text-[11px] px-2.5 py-0.5">
                  Step 1 of 5
                </Badge>
                <CardTitle className="text-xl font-extrabold tracking-tight">Common App Student Profile</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Enter your details to customize your personal statement concepts.
                </CardDescription>
              </div>
              <div className="shrink-0">
                <Button
                  onClick={() => setCurrentStep(2)}
                  className="h-11 px-8 font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl text-sm shadow-md shadow-orange-500/20 whitespace-nowrap"
                >
                  Continue to Story Vault <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Your Name</label>
                  <Input
                    value={profile.name}
                    onChange={(e) => updateProfile("name", e.target.value)}
                    placeholder="e.g. Alex"
                    className="h-11 font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Intended Major</label>
                  <Input
                    value={profile.intendedMajor}
                    onChange={(e) => updateProfile("intendedMajor", e.target.value)}
                    placeholder="e.g. Mechanical Engineering"
                    className="h-11 font-medium"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Target Colleges</label>
                <Input
                  value={profile.colleges}
                  onChange={(e) => updateProfile("colleges", e.target.value)}
                  placeholder="e.g. MIT, Stanford, Michigan"
                  className="h-11 font-medium"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: STORY VAULT */}
        {currentStep === 2 && (
          <Card className="border-border/40 shadow-sm animate-card-pop">
            <CardHeader className="p-6 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <Badge className="w-fit bg-orange-500/10 text-orange-500 border-orange-500/20 font-bold text-[11px] px-2.5 py-0.5">
                  Step 2 of 5
                </Badge>
                <CardTitle className="text-xl font-extrabold tracking-tight">Your Saved Stories & Memories</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Store anecdotes and personal experiences for your Common App essay.
                </CardDescription>
              </div>
              <div className="shrink-0">
                <Button
                  onClick={() => setCurrentStep(3)}
                  className="h-10 px-6 font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl shadow-md shadow-orange-500/20 whitespace-nowrap"
                >
                  Next: Generate Essay Ideas <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">

              {/* Interactive Story Assistant Helper Banner */}
              {vaultStories.length === 0 && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-card border border-orange-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-extrabold text-sm">
                    <Lightbulb className="h-4 w-4 text-orange-500" />
                    <span>Have no stories saved? We can help you extract a memory!</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    College admissions officers look for real-life experiences. Click any quick story starter below or use 🎙️ Voice Dictation to speak a story aloud!
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddPresetStory("Fixing a Gearbox & Reversed Spacer", "We spent three days building a custom gearbox that kept jamming. I found a tiny reversed spacer that shifted the shaft by 1mm.")}
                      className="h-8 text-xs font-semibold border-orange-500/30 text-foreground hover:bg-orange-500/10 whitespace-nowrap"
                    >
                      <PlusCircle className="mr-1.5 h-3.5 w-3.5 text-orange-500" /> ⚙️ Gearbox & Spacer Error
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddPresetStory("Fixing a Car Engine", "I spent weekends working on an old car engine, getting my hands greasy trying to figure out why the combustion cycle kept failing.")}
                      className="h-8 text-xs font-semibold border-orange-500/30 text-foreground hover:bg-orange-500/10 whitespace-nowrap"
                    >
                      <PlusCircle className="mr-1.5 h-3.5 w-3.5 text-orange-500" /> 🚗 Old Car Engine Repair
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddPresetStory("Robot Sensor Failure at Regionals", "During regional robotics, our optical sensor died right before autonomous mode. I rewrote the loop to use wheel encoders in 15 minutes.")}
                      className="h-8 text-xs font-semibold border-orange-500/30 text-foreground hover:bg-orange-500/10 whitespace-nowrap"
                    >
                      <PlusCircle className="mr-1.5 h-3.5 w-3.5 text-orange-500" /> 🤖 Robot Sensor Malfunction
                    </Button>
                  </div>
                </div>
              )}

              {/* Add Story with Voice Dictation */}
              <div className="p-4 rounded-2xl border border-orange-500/20 bg-orange-500/5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-bold text-orange-500 uppercase">Add Personal Anecdote</p>
                  
                  {/* Voice-to-Text Dictation Button */}
                  <Button
                    type="button"
                    size="sm"
                    variant={isRecording ? "destructive" : "outline"}
                    onClick={handleToggleVoiceDictation}
                    className={`h-8 text-xs font-bold whitespace-nowrap transition-all ${
                      isRecording ? "animate-pulse shadow-md" : "border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10"
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="mr-1.5 h-3.5 w-3.5" /> Stop Dictating
                      </>
                    ) : (
                      <>
                        <Mic className="mr-1.5 h-3.5 w-3.5 text-orange-500" /> Dictate Story (Voice-to-Text)
                      </>
                    )}
                  </Button>
                </div>

                {isRecording && (
                  <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 font-bold flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    Listening to your voice... Speak your anecdote aloud!
                  </div>
                )}

                {speechError && (
                  <p className="text-xs text-amber-500 font-semibold">{speechError}</p>
                )}

                <Input
                  value={newStoryTitle}
                  onChange={(e) => setNewStoryTitle(e.target.value)}
                  placeholder="Story Title (e.g. Fixing the Engine)"
                  className="h-10 text-xs font-bold"
                />
                <Textarea
                  rows={3}
                  value={newStoryContent}
                  onChange={(e) => setNewStoryContent(e.target.value)}
                  placeholder="Type or dictate your story aloud... What happened, how did you react, and what did you learn?"
                  className="text-xs leading-relaxed"
                />
                <div className="flex justify-end">
                  <Button size="sm" onClick={handleAddVaultEntry} className="h-9 px-5 text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl shadow-xs whitespace-nowrap">
                    Save to Vault
                  </Button>
                </div>
              </div>

              {/* Story Cards */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {vaultStories.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">No stories saved yet. Add or dictate one above!</p>
                ) : (
                  vaultStories.map((story) => (
                    <div key={story.id} className="p-3 rounded-xl border border-border/40 bg-card flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-orange-500" /> {story.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{story.content}</p>
                      </div>
                      <button
                        onClick={() => {
                          const updated = vaultStories.filter(s => s.id !== story.id);
                          setVaultStories(updated);
                          localStorage.setItem("essayforge_lite_stories", JSON.stringify(updated));
                        }}
                        className="text-muted-foreground hover:text-red-500 p-1 shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 3: ESSAY IDEAS */}
        {currentStep === 3 && (
          <Card className="border-border/40 shadow-sm animate-card-pop">
            <CardHeader className="p-6 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <Badge className="w-fit bg-orange-500/10 text-orange-500 border-orange-500/20 font-bold text-[11px] px-2.5 py-0.5">
                  Step 3 of 5
                </Badge>
                <CardTitle className="text-xl font-extrabold tracking-tight">Generate Common App Concepts</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Select a Common App prompt and generate custom essay concepts.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Skip Step 2 Warning Banner */}
              {vaultStories.length === 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Adding at least 1 personal memory in Step 2 unlocks personalized concepts tailored to your life!</span>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setCurrentStep(2)} className="h-7 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20">
                    Add Story <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <select
                  value={selectedPrompt}
                  onChange={(e) => setSelectedPrompt(e.target.value)}
                  className="flex-1 h-11 px-3 rounded-xl border border-border/40 bg-card text-foreground text-sm font-semibold focus:outline-none"
                >
                  <option value="Common App #1: Meaningful Background or Identity">Common App #1: Meaningful Background or Identity</option>
                  <option value="Common App #2: Overcoming Obstacles & Lessons Learned">Common App #2: Overcoming Obstacles & Lessons Learned</option>
                  <option value="Common App #3: Challenging a Belief or Idea">Common App #3: Challenging a Belief or Idea</option>
                  <option value="Common App #4: Gratitude or Unexpected Impact">Common App #4: Gratitude or Unexpected Impact</option>
                  <option value="Common App #5: Moment of Personal Growth">Common App #5: Moment of Personal Growth</option>
                  <option value="Common App #6: Captivating Topic or Interest">Common App #6: Captivating Topic or Interest</option>
                  <option value="Common App #7: Open Topic of Choice">Common App #7: Open Topic of Choice</option>
                </select>

                <Button
                  disabled={ideasLoading}
                  onClick={handleGenerateIdeas}
                  className="h-11 px-6 font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl w-full sm:w-auto shadow-md shadow-orange-500/20 whitespace-nowrap shrink-0"
                >
                  {ideasLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Brainstorm Ideas
                </Button>
              </div>

              {/* Ideas Display */}
              {ideas.length > 0 ? (
                <div className="space-y-3 pt-2">
                  {ideas.map((idea, idx) => (
                    <div key={idea.id || idx} className="p-4 rounded-2xl border border-border/40 bg-card hover:border-orange-500/40 transition-all space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-base text-orange-600 dark:text-orange-400">{idea.title}</h3>
                        <Badge variant="outline" className="text-xs font-bold border-orange-500/30 text-orange-500">
                          Fit: {idea.originalityScore}/100
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{idea.summary}</p>
                      <div className="p-2.5 rounded-xl bg-secondary/50 text-xs">
                        <p className="font-semibold text-foreground">💡 Why It Works: <span className="font-normal text-muted-foreground">{idea.whyItWorks}</span></p>
                      </div>
                      <div className="flex justify-end pt-1">
                        <Button
                          onClick={() => handleSelectIdea(idea)}
                          className="h-9 px-5 text-xs font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl shadow-xs whitespace-nowrap"
                        >
                          Write College Essay <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 space-y-3 bg-secondary/20 rounded-2xl border border-dashed border-border/40">
                  <Sparkles className="h-8 w-8 text-orange-500 mx-auto" />
                  <p className="text-xs text-muted-foreground">Click "Brainstorm Ideas" above to generate unique essay angles for {selectedPrompt}!</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* STEP 4: WRITE COLLEGE ESSAY (100% MANUAL CONTROL - NO AUTO GENERATION ON TAB CLICK) */}
        {currentStep === 4 && (
          <Card className="border-border/40 shadow-sm animate-card-pop">
            <CardHeader className="p-6 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <Badge className="w-fit bg-orange-500/10 text-orange-500 border-orange-500/20 font-bold text-[11px] px-2.5 py-0.5">
                  Step 4 of 5
                </Badge>
                <CardTitle className="text-xl font-extrabold tracking-tight">Write College Essay</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Switch freely between your Story Vault draft workspace and a fresh open narrative workspace!
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Badge
                  variant="outline"
                  className={`text-xs font-bold py-1.5 px-3 shrink-0 ${wordCount > 650 ? "border-red-500 text-red-500" : "border-emerald-500 text-emerald-500"}`}
                >
                  {wordCount} / 650 words
                </Badge>

                <Button
                  disabled={!draftWithStories.trim() && !draftWithoutStories.trim()}
                  onClick={() => setCurrentStep(5)}
                  className="h-10 px-5 font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl shadow-md shadow-orange-500/20 whitespace-nowrap shrink-0"
                >
                  View Admissions Feedback <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {aiErrorMsg && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>{aiErrorMsg}</span>
                </div>
              )}

              {/* Pure Tab Mode Switcher */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-2 rounded-2xl bg-secondary/50 border border-border/40 gap-2">
                <span className="text-xs font-bold text-muted-foreground px-2">Workspace Mode:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSwitchDraftTab(true)}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      useStoriesOption
                        ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-card"
                    }`}
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    With Story Vault ✨ {draftWithStories.trim() ? "(Saved)" : "(Empty)"}
                  </button>

                  <button
                    onClick={() => handleSwitchDraftTab(false)}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      !useStoriesOption
                        ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-card"
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Without Stories (Fresh Narrative) ✍️ {draftWithoutStories.trim() ? "(Saved)" : "(Empty)"}
                  </button>
                </div>
              </div>

              {autoDraftLoading ? (
                <div className="py-20 text-center space-y-3 bg-secondary/30 rounded-2xl border border-dashed border-orange-500/30">
                  <Loader2 className="h-10 w-10 text-orange-500 animate-spin mx-auto" />
                  <p className="text-sm font-bold text-foreground">
                    {useStoriesOption ? "Generating Common App essay with your Story Vault anecdotes..." : "Generating fresh open narrative Common App essay..."}
                  </p>
                  <p className="text-xs text-muted-foreground">Writing in an authentic, conversational high school senior voice (zero AI clichés & zero em dashes).</p>
                </div>
              ) : (
                <>
                  <Textarea
                    rows={16}
                    value={essayText}
                    onChange={(e) => handleUpdateEssayText(e.target.value)}
                    placeholder={
                      useStoriesOption
                        ? "Write, paste, or click 'Generate AI Draft ✨' to create an essay using your Story Vault anecdotes..."
                        : "Write, paste, or click 'Generate AI Draft ✨' to create a fresh open narrative essay..."
                    }
                    className="text-sm leading-relaxed"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleStartNewEssay}
                      className="text-xs text-muted-foreground hover:text-foreground whitespace-nowrap"
                    >
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset Draft & Start Fresh
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateOrRegenerateDraft}
                        className="text-xs font-bold text-orange-600 dark:text-orange-400 border-orange-500/30 hover:bg-orange-500/10 whitespace-nowrap shrink-0"
                      >
                        <Wand2 className="mr-1.5 h-3.5 w-3.5 text-orange-500" />
                        {essayText.trim() ? "Regenerate AI Draft ✨" : "Generate AI Draft ✨"}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* STEP 5: AUTOMATIC DUAL ADMISSIONS RUBRIC FEEDBACK */}
        {currentStep === 5 && (
          <Card className="border-border/40 shadow-sm animate-card-pop">
            <CardHeader className="p-6 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <Badge className="w-fit bg-orange-500/10 text-orange-500 border-orange-500/20 font-bold text-[11px] px-2.5 py-0.5">
                  Step 5 of 5
                </Badge>
                <CardTitle className="text-xl font-extrabold tracking-tight">Admissions Dean Rubric Evaluation</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Evaluated with Stanford/Ivy League Admissions Dean rigor!
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  onClick={() => setCurrentStep(4)}
                  variant="outline"
                  className="h-9 px-3 text-xs font-semibold border-border/40 whitespace-nowrap"
                >
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Editor
                </Button>
                <Button
                  onClick={handleStartNewEssay}
                  className="h-9 px-4 text-xs font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl shadow-md whitespace-nowrap"
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Start Next Essay
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {/* Dual Feedback Mode Switcher Header */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-2 rounded-2xl bg-secondary/50 border border-border/40 gap-2">
                <span className="text-xs font-bold text-muted-foreground px-2">Compare Version Feedback:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveFeedbackTab("with")}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeFeedbackTab === "with"
                        ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-card"
                    }`}
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    With Story Vault ✨ {feedbackWithStories ? `(Score: ${feedbackWithStories.overallScore})` : "(Grading...)"}
                  </button>

                  <button
                    onClick={() => setActiveFeedbackTab("without")}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeFeedbackTab === "without"
                        ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-card"
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Without Stories (Fresh Narrative) ✍️ {feedbackWithoutStories ? `(Score: ${feedbackWithoutStories.overallScore})` : "(Grading...)"}
                  </button>
                </div>
              </div>

              {feedbackLoading ? (
                <div className="py-16 text-center space-y-3">
                  <Loader2 className="h-10 w-10 text-orange-500 animate-spin mx-auto" />
                  <p className="text-sm font-bold text-foreground">Admissions Dean is automatically evaluating your essays against Ivy League rubrics...</p>
                  <p className="text-xs text-muted-foreground">Applying strict Story Vault anecdote checks, voice authenticity analysis, and reflection rigor.</p>
                </div>
              ) : currentFeedback ? (
                <div className="space-y-4">
                  {/* Score Card */}
                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                    activeFeedbackTab === "with" 
                      ? "bg-gradient-to-r from-emerald-500/10 via-card to-card border-emerald-500/30" 
                      : "bg-gradient-to-r from-amber-500/10 via-card to-card border-amber-500/30"
                  }`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs font-bold ${
                          activeFeedbackTab === "with" ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400" : "border-amber-500/40 text-amber-600 dark:text-amber-400"
                        }`}>
                          {activeFeedbackTab === "with" ? "✨ With Story Vault Anecdotes (High Specificity)" : "✍️ Without Stories (Open Narrative Penalty)"}
                        </Badge>
                      </div>
                      <h3 className="font-extrabold text-lg mt-1">Admissions Fit Score</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{currentFeedback.summary}</p>
                    </div>
                    <div className={`h-16 w-16 rounded-full font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-md ${
                      activeFeedbackTab === "with"
                        ? "bg-gradient-to-tr from-emerald-500 to-teal-600 text-white"
                        : "bg-gradient-to-tr from-amber-500 to-orange-600 text-white"
                    }`}>
                      {currentFeedback.overallScore}
                    </div>
                  </div>

                  {/* Organic Score Upgrade Suggestion Box for Low Score / No Stories */}
                  {activeFeedbackTab === "without" && currentFeedback.overallScore < 85 && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-card border border-orange-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-sm text-orange-600 dark:text-orange-400 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-orange-500" /> Want to boost this score from {currentFeedback.overallScore} to 92+?
                        </h4>
                        <Button
                          size="sm"
                          onClick={() => setCurrentStep(2)}
                          className="h-8 px-4 text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl shadow-xs whitespace-nowrap shrink-0"
                        >
                          Add Story in Step 2 <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        This essay scored {currentFeedback.overallScore}/100 because it lacks concrete personal memories. Adding even 1 real anecdote to your Story Vault boosts your Authenticity and Specificity scores to 92+!
                      </p>
                    </div>
                  )}

                  {/* Subscores Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-card border border-border/40 text-center">
                      <p className="text-[11px] text-muted-foreground">Authenticity</p>
                      <p className={`font-extrabold text-sm ${currentFeedback.authenticityScore >= 85 ? "text-emerald-500" : "text-amber-500"}`}>
                        {currentFeedback.authenticityScore}/100
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-card border border-border/40 text-center">
                      <p className="text-[11px] text-muted-foreground">Reflection</p>
                      <p className="font-extrabold text-sm text-foreground">{currentFeedback.reflectionScore}/100</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-card border border-border/40 text-center">
                      <p className="text-[11px] text-muted-foreground">Specificity</p>
                      <p className={`font-extrabold text-sm ${currentFeedback.specificityScore >= 85 ? "text-emerald-500" : "text-amber-500"}`}>
                        {currentFeedback.specificityScore}/100
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-card border border-border/40 text-center">
                      <p className="text-[11px] text-muted-foreground">Grammar & Flow</p>
                      <p className="font-extrabold text-sm text-foreground">{currentFeedback.grammarScore}/100</p>
                    </div>
                  </div>

                  {/* Strengths & Reflection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">Core Strengths</p>
                      {currentFeedback.strengths.map((s, i) => (
                        <p key={i} className="text-muted-foreground">• {s}</p>
                      ))}
                    </div>
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                      <p className="font-bold text-amber-600 dark:text-amber-400">Growth & Admissions Opportunities</p>
                      {currentFeedback.weaknesses.map((w, i) => (
                        <p key={i} className="text-muted-foreground">• {w}</p>
                      ))}
                    </div>
                  </div>

                  {/* Line Feedback */}
                  {currentFeedback.lineFeedback && currentFeedback.lineFeedback.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="font-bold text-sm">Line Coaching Tips</h4>
                      {currentFeedback.lineFeedback.map((fb, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-secondary/50 border border-border/40 text-xs space-y-1">
                          <p className="font-semibold italic text-muted-foreground">"{fb.original}"</p>
                          <p className="font-bold text-orange-500">💡 {fb.suggestion}</p>
                          <p className="text-muted-foreground">{fb.reasoning}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Start New Essay Footer CTA */}
                  <div className="pt-4 flex justify-center">
                    <Button
                      onClick={handleStartNewEssay}
                      className="h-11 px-8 font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl shadow-md text-sm whitespace-nowrap"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" /> Start Next Essay
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 space-y-3">
                  <p className="text-xs text-muted-foreground">
                    No draft detected for {activeFeedbackTab === "with" ? "the 'With Story Vault' draft" : "the 'Without Stories' draft"}.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentStep(4)}
                    className="text-xs font-bold border-orange-500/30 text-orange-500"
                  >
                    Go Back to Editor to Generate Draft
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
