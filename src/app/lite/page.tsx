"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { conductInterviewStep, generateDetailedEssayIdeas, analyzeEssayComprehensive, DetailedEssayIdea, ComprehensiveEssayAnalysis } from "@/lib/aiService";
import { 
  Bot, 
  User, 
  MessageSquareCode, 
  Archive, 
  Sparkles, 
  PenTool, 
  BrainCircuit, 
  ArrowRight, 
  ArrowLeft,
  Check, 
  Loader2, 
  Plus, 
  CheckCircle2, 
  ExternalLink,
  RefreshCw,
  BookOpen,
  Trash2
} from "lucide-react";

export default function LiteWizardPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1 State: Profile
  const [profile, setProfile] = useState({ name: "", intendedMajor: "", colleges: "" });

  // Step 2 State: Interview
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: "ai" | "user"; text: string }>>([
    { id: "1", sender: "ai", text: "Welcome! Tell me about a challenge, project, or moment in high school that changed how you see things." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Step 3 State: Story Vault
  const [vaultStories, setVaultStories] = useState<Array<{ id: string; title: string; content: string }>>([]);
  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [newStoryContent, setNewStoryContent] = useState("");

  // Step 4 State: Ideas
  const [selectedPrompt, setSelectedPrompt] = useState("Common App #2: Overcoming Obstacles");
  const [ideas, setIdeas] = useState<DetailedEssayIdea[]>([]);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [chosenIdea, setChosenIdea] = useState<DetailedEssayIdea | null>(null);

  // Step 5 State: Essay Writer
  const [essayText, setEssayText] = useState("");

  // Step 6 State: Feedback
  const [feedback, setFeedback] = useState<ComprehensiveEssayAnalysis | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const chatRef = useRef<HTMLDivElement>(null);

  // Initialize from LocalStorage
  useEffect(() => {
    const savedProf = localStorage.getItem("essayforge_lite_profile");
    if (savedProf) {
      try { setProfile(JSON.parse(savedProf)); } catch (e) {}
    }
    const savedStories = localStorage.getItem("essayforge_lite_stories");
    if (savedStories) {
      try { setVaultStories(JSON.parse(savedStories)); } catch (e) {}
    }
    const savedEssay = localStorage.getItem("essayforge_lite_essay");
    if (savedEssay) {
      setEssayText(savedEssay);
    }
  }, []);

  // Save profile changes
  const updateProfile = (field: string, val: string) => {
    const updated = { ...profile, [field]: val };
    setProfile(updated);
    localStorage.setItem("essayforge_lite_profile", JSON.stringify(updated));
  };

  // Step 2 Chat Send
  const handleChatSend = async () => {
    if (!chatInput.trim() || aiLoading) return;
    const userMsg = { id: Date.now().toString(), sender: "user" as const, text: chatInput.trim() };
    const updated = [...chatMessages, userMsg];
    setChatMessages(updated);
    setChatInput("");
    setAiLoading(true);

    try {
      const history = updated.map(m => ({
        role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
        content: m.text
      }));
      const reply = await conductInterviewStep(history, profile);
      setChatMessages([...updated, { id: (Date.now() + 1).toString(), sender: "ai", text: reply }]);
    } catch (e) {
      setChatMessages([...updated, { id: (Date.now() + 1).toString(), sender: "ai", text: "Got it! Feel free to save this memory below and move to the next step." }]);
    } finally {
      setAiLoading(false);
    }
  };

  const saveMemoryToVault = (text: string) => {
    const newEntry = {
      id: Date.now().toString(),
      title: text.slice(0, 40) + "...",
      content: text
    };
    const updated = [newEntry, ...vaultStories];
    setVaultStories(updated);
    localStorage.setItem("essayforge_lite_stories", JSON.stringify(updated));
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

  // Step 4 Ideas Generator
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

  const handleSelectIdea = (idea: DetailedEssayIdea) => {
    setChosenIdea(idea);
    const initialDraft = essayText || `Title: ${idea.title}\n\nHook:\n${idea.hook}\n\nDraft:\n`;
    setEssayText(initialDraft);
    localStorage.setItem("essayforge_lite_essay", initialDraft);
    setCurrentStep(5);
  };

  // Step 6 Feedback Generator
  const handleRunFeedback = async () => {
    if (!essayText.trim()) return;
    setFeedbackLoading(true);
    setCurrentStep(6);
    try {
      const res = await analyzeEssayComprehensive(essayText, selectedPrompt, profile);
      setFeedback(res);
    } catch (e) {
      // Fallback
    } finally {
      setFeedbackLoading(false);
    }
  };

  const stepsList = [
    { num: 1, name: "Profile", icon: User },
    { num: 2, name: "Interview", icon: MessageSquareCode },
    { num: 3, name: "Vault", icon: Archive },
    { num: 4, name: "Ideas", icon: Sparkles },
    { num: 5, name: "Write", icon: PenTool },
    { num: 6, name: "Feedback", icon: BrainCircuit },
  ];

  const wordCount = essayText.split(/\s+/).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 md:p-8">
      {/* Lite Minimal Top Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between py-4 mb-6 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight flex items-center gap-2">
              EssayForge <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-bold border border-indigo-500/20">Lite MVP</span>
            </h1>
            <p className="text-xs text-muted-foreground">Minimal Common App Personal Statement Wizard</p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="text-xs font-semibold border-border/40">
          <Link href="/dashboard">
            Switch to Full App <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {/* Step Wizard Progress Bar */}
      <div className="w-full max-w-4xl mb-8">
        <div className="flex items-center justify-between bg-card p-2 rounded-2xl border border-border/40 shadow-xs">
          {stepsList.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.num;
            const isDone = currentStep > step.num;

            return (
              <button
                key={step.num}
                onClick={() => setCurrentStep(step.num)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md scale-[1.02]"
                    : isDone
                    ? "text-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[11px] ${
                  isActive ? "bg-white/20 text-white" : isDone ? "bg-indigo-500 text-white" : "bg-muted text-muted-foreground"
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
            <CardHeader>
              <Badge className="w-fit mb-1 bg-indigo-500/10 text-indigo-500 border-indigo-500/20 font-bold">Step 1 of 6</Badge>
              <CardTitle className="text-xl">Common App Student Profile</CardTitle>
              <CardDescription>Tell us a little bit about yourself to customize your essay concepts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <div className="pt-4 flex justify-end">
                <Button
                  onClick={() => setCurrentStep(2)}
                  className="h-11 px-8 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm"
                >
                  Continue to Story Discovery <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: AI INTERVIEW */}
        {currentStep === 2 && (
          <Card className="border-border/40 shadow-sm flex flex-col h-[520px] animate-card-pop">
            <CardHeader className="py-4 border-b border-border/40 flex flex-row items-center justify-between">
              <div>
                <Badge className="w-fit mb-1 bg-indigo-500/10 text-indigo-500 border-indigo-500/20 font-bold">Step 2 of 6</Badge>
                <CardTitle className="text-lg">AI Story Discovery Chat</CardTitle>
              </div>
              <Button
                onClick={() => setCurrentStep(3)}
                className="h-9 px-4 text-xs font-bold bg-indigo-600 text-white rounded-xl"
              >
                Go to Story Vault ({vaultStories.length}) <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
              <div ref={chatRef} className="flex-1 overflow-y-auto space-y-3 pr-2">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                    <div className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[85%] ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-br-none font-medium"
                        : "bg-secondary text-foreground rounded-bl-none border border-border/40"
                    }`}>
                      {msg.text}
                    </div>
                    {msg.sender === "user" && (
                      <button
                        onClick={() => saveMemoryToVault(msg.text)}
                        className="text-[11px] font-bold text-indigo-500 hover:underline mt-1 flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" /> Save to Vault
                      </button>
                    )}
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                    <span>AI Coach is pondering...</span>
                  </div>
                )}
              </div>
              <div className="pt-3 border-t border-border/40 flex items-center gap-2">
                <Textarea
                  rows={2}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChatSend(); } }}
                  placeholder="Type a story or response..."
                  className="text-xs sm:text-sm resize-none"
                />
                <Button
                  disabled={aiLoading || !chatInput.trim()}
                  onClick={handleChatSend}
                  className="h-10 px-5 font-bold bg-indigo-600 text-white rounded-xl shrink-0"
                >
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 3: STORY VAULT */}
        {currentStep === 3 && (
          <Card className="border-border/40 shadow-sm animate-card-pop">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <Badge className="w-fit mb-1 bg-indigo-500/10 text-indigo-500 border-indigo-500/20 font-bold">Step 3 of 6</Badge>
                <CardTitle className="text-xl">Your Saved Stories</CardTitle>
              </div>
              <Button
                onClick={() => setCurrentStep(4)}
                className="h-10 px-6 font-bold bg-indigo-600 text-white rounded-xl"
              >
                Next: Generate Essay Ideas <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Add Story */}
              <div className="p-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 space-y-2">
                <p className="text-xs font-bold text-indigo-500 uppercase">Quick Add Anecdote</p>
                <Input
                  value={newStoryTitle}
                  onChange={(e) => setNewStoryTitle(e.target.value)}
                  placeholder="Story Title (e.g. Fixing the Sensor)"
                  className="h-9 text-xs font-bold"
                />
                <Textarea
                  rows={2}
                  value={newStoryContent}
                  onChange={(e) => setNewStoryContent(e.target.value)}
                  placeholder="What happened and what did you learn?"
                  className="text-xs"
                />
                <div className="flex justify-end">
                  <Button size="sm" onClick={handleAddVaultEntry} className="h-8 text-xs font-bold bg-indigo-600 text-white">
                    Save to Vault
                  </Button>
                </div>
              </div>

              {/* Story Cards */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {vaultStories.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">No stories saved yet. Add one above or chat in Step 2!</p>
                ) : (
                  vaultStories.map((story) => (
                    <div key={story.id} className="p-3 rounded-xl border border-border/40 bg-card flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-indigo-500" /> {story.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{story.content}</p>
                      </div>
                      <button
                        onClick={() => {
                          const updated = vaultStories.filter(s => s.id !== story.id);
                          setVaultStories(updated);
                          localStorage.setItem("essayforge_lite_stories", JSON.stringify(updated));
                        }}
                        className="text-muted-foreground hover:text-red-500 p-1"
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

        {/* STEP 4: ESSAY IDEAS */}
        {currentStep === 4 && (
          <Card className="border-border/40 shadow-sm animate-card-pop">
            <CardHeader>
              <Badge className="w-fit mb-1 bg-indigo-500/10 text-indigo-500 border-indigo-500/20 font-bold">Step 4 of 6</Badge>
              <CardTitle className="text-xl">Generate Common App Concepts</CardTitle>
              <CardDescription>Select a Common App prompt and generate 3 custom essay concepts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  className="h-11 px-6 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl w-full sm:w-auto"
                >
                  {ideasLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Brainstorm Ideas
                </Button>
              </div>

              {/* Ideas Display */}
              {ideas.length > 0 && (
                <div className="space-y-3 pt-2">
                  {ideas.map((idea, idx) => (
                    <div key={idea.id || idx} className="p-4 rounded-2xl border border-border/40 bg-card hover:border-indigo-500/40 transition-all space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-base text-indigo-600 dark:text-indigo-400">{idea.title}</h3>
                        <Badge variant="outline" className="text-xs font-bold border-indigo-500/30 text-indigo-500">
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
                          className="h-9 px-5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                        >
                          Write This Essay <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* STEP 5: WRITE ESSAY */}
        {currentStep === 5 && (
          <Card className="border-border/40 shadow-sm animate-card-pop">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <Badge className="w-fit mb-1 bg-indigo-500/10 text-indigo-500 border-indigo-500/20 font-bold">Step 5 of 6</Badge>
                <CardTitle className="text-xl">Write Personal Statement</CardTitle>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={`text-xs font-bold ${wordCount > 650 ? "border-red-500 text-red-500" : "border-emerald-500 text-emerald-500"}`}
                >
                  {wordCount} / 650 words
                </Badge>
                <Button
                  disabled={!essayText.trim()}
                  onClick={handleRunFeedback}
                  className="h-10 px-6 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md"
                >
                  Get Admissions Feedback <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <Textarea
                rows={16}
                value={essayText}
                onChange={(e) => {
                  setEssayText(e.target.value);
                  localStorage.setItem("essayforge_lite_essay", e.target.value);
                }}
                placeholder="Write your Common App Personal Statement draft here... (Target limit: 650 words)"
                className="text-sm leading-relaxed"
              />
            </CardContent>
          </Card>
        )}

        {/* STEP 6: FEEDBACK */}
        {currentStep === 6 && (
          <Card className="border-border/40 shadow-sm animate-card-pop">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <Badge className="w-fit mb-1 bg-indigo-500/10 text-indigo-500 border-indigo-500/20 font-bold">Step 6 of 6</Badge>
                <CardTitle className="text-xl">Admissions Rubric Feedback</CardTitle>
              </div>
              <Button
                onClick={() => setCurrentStep(5)}
                variant="outline"
                className="h-9 text-xs font-semibold border-border/40"
              >
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Editor
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {feedbackLoading ? (
                <div className="py-16 text-center space-y-3">
                  <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mx-auto" />
                  <p className="text-sm font-bold text-foreground">Evaluating your Common App essay...</p>
                </div>
              ) : feedback ? (
                <div className="space-y-4">
                  {/* Score */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-card to-card border border-indigo-500/30 flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-lg">Overall Admissions Fit Score</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{feedback.summary}</p>
                    </div>
                    <div className="h-16 w-16 rounded-full bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-md">
                      {feedback.overallScore}
                    </div>
                  </div>

                  {/* Strengths & Reflection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">Core Strengths</p>
                      {feedback.strengths.map((s, i) => (
                        <p key={i} className="text-muted-foreground">• {s}</p>
                      ))}
                    </div>
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                      <p className="font-bold text-amber-600 dark:text-amber-400">Growth Opportunities</p>
                      {feedback.weaknesses.map((w, i) => (
                        <p key={i} className="text-muted-foreground">• {w}</p>
                      ))}
                    </div>
                  </div>

                  {/* Line Feedback */}
                  {feedback.lineFeedback && feedback.lineFeedback.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="font-bold text-sm">Line Coaching Tips</h4>
                      {feedback.lineFeedback.map((fb, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-secondary/50 border border-border/40 text-xs space-y-1">
                          <p className="font-semibold italic text-muted-foreground">"{fb.original}"</p>
                          <p className="font-bold text-indigo-500">💡 {fb.suggestion}</p>
                          <p className="text-muted-foreground">{fb.reasoning}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-8">Click "Get Admissions Feedback" in Step 5 to analyze your essay.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
