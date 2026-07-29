"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { conductInterviewStep } from "@/lib/aiService";
import { MessageSquareCode, Send, Bot, User, Archive, AlertCircle, RefreshCw } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function AIInterviewPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "assistant",
      content: "Welcome! I'm your AI Story Discovery Coach. My goal is to help you uncover compelling personal anecdotes for your college application essays. Let's start: What is an experience or project outside of class that made you forget what time it was?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedToVault, setSavedToVault] = useState<string | null>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTop = chatScrollContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsgText = input.trim();
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      content: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.sender,
        content: m.content
      }));

      let profile = null;
      try {
        const saved = localStorage.getItem("essayforge_profile");
        if (saved) profile = JSON.parse(saved);
      } catch (e) {}

      const aiResponse = await conductInterviewStep(history, profile);

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to reach LM Studio server. Make sure LM Studio is running at http://127.0.0.1:1234");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToVault = (content: string) => {
    try {
      const existing = localStorage.getItem("essayforge_stories");
      const stories = existing ? JSON.parse(existing) : [];
      const newStory = {
        id: Date.now(),
        title: "Discovered Story Insight",
        category: "Personal Growth",
        content: content,
        keyTakeaways: "Discovered during AI Interview session",
        createdAt: new Date().toLocaleDateString()
      };
      localStorage.setItem("essayforge_stories", JSON.stringify([newStory, ...stories]));
      setSavedToVault(newStory.id.toString());
      setTimeout(() => setSavedToVault(null), 3000);
    } catch (e) {
      console.error("Failed to save story to vault:", e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-10rem)] space-y-4 overflow-hidden">
      {/* Fixed Page Title Header */}
      <div className="shrink-0">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3 text-foreground">
          <MessageSquareCode className="h-7 w-7 text-emerald-500" />
          AI Story Interviewer
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Uncover authentic life experiences, challenges, and passions through interactive questions powered by local LM Studio.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 text-amber-500 text-sm flex items-start gap-3 shrink-0">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">LM Studio Connection Issue</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Chat container that fills remaining height without scrolling outer page */}
      <Card className="flex-1 border-border/40 flex flex-col min-h-0 overflow-hidden">
        <div ref={chatScrollContainerRef} className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} animate-card-pop`}
              >
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  isUser ? "bg-indigo-600 text-white" : "bg-emerald-600 text-white"
                }`}>
                  {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </div>

                <div className={`space-y-1.5 max-w-[80%] ${isUser ? "text-right" : "text-left"}`}>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isUser
                      ? "bg-indigo-600 text-white rounded-tr-none shadow-xs"
                      : "bg-secondary/80 border border-border/40 text-foreground rounded-tl-none"
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  <div className="flex items-center gap-2 px-1 text-[11px] text-muted-foreground justify-end">
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleSaveToVault(msg.content)}
                        className="inline-flex items-center gap-1 text-emerald-500 hover:text-emerald-400 font-semibold transition-colors ml-2"
                      >
                        <Archive className="h-3 w-3" />
                        {savedToVault === msg.id ? "Saved to Story Vault!" : "Save Story Insight"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start gap-3 animate-pulse">
              <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Bot className="h-5 w-5 animate-pulse" />
              </div>
              <div className="p-4 rounded-2xl bg-secondary/80 border border-border/40 text-sm text-muted-foreground flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-emerald-500" />
                Thinking & generating follow-up question via LM Studio...
              </div>
            </div>
          )}
        </div>

        {/* Fixed Input Bar */}
        <div className="p-4 border-t border-border/40 bg-card/80 dark:bg-slate-950/80 shrink-0">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Share a story, memory, or reflection..."
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !input.trim()} className="px-6 font-bold bg-indigo-600 text-white hover:bg-indigo-500">
              <Send className="h-4 w-4 mr-1.5" /> Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}