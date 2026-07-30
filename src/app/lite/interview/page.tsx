"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { conductInterviewStep } from "@/lib/aiService";
import { MessageSquareCode, ArrowRight, Send, PlusCircle, Check, Loader2 } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
}

export default function LiteInterviewPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "ai",
      text: "Welcome! I'm your AI Story Coach. Tell me about a moment, project, or challenge high school that made you see things differently."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedStoriesCount, setSavedStoriesCount] = useState(0);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const existing = localStorage.getItem("essayforge_lite_stories");
    if (existing) {
      try {
        setSavedStoriesCount(JSON.parse(existing).length);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), sender: "user", text: input.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const history = updatedMessages.map(m => ({
        role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
        content: m.text
      }));

      const replyText = await conductInterviewStep(history);
      setMessages([...updatedMessages, { id: (Date.now() + 1).toString(), sender: "ai", text: replyText }]);
    } catch (e: any) {
      setMessages([...updatedMessages, { id: (Date.now() + 1).toString(), sender: "ai", text: "Note: LM Studio connection issue. Share a memory above and click 'Save Story to Vault' to save it!" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToVault = (text: string) => {
    const existing = localStorage.getItem("essayforge_lite_stories");
    const list = existing ? JSON.parse(existing) : [];
    const newStory = {
      id: Date.now().toString(),
      title: text.slice(0, 45) + "...",
      content: text,
      date: new Date().toLocaleDateString()
    };
    const updated = [newStory, ...list];
    localStorage.setItem("essayforge_lite_stories", JSON.stringify(updated));
    setSavedStoriesCount(updated.length);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 flex flex-col h-[calc(100vh-140px)]">
      {/* Step Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Step 2 of 6</span>
          <h1 className="text-xl font-extrabold text-foreground flex items-center gap-2">
            <MessageSquareCode className="h-5 w-5 text-indigo-500" /> AI Story Interviewer
          </h1>
        </div>
        <Button
          onClick={() => router.push("/lite/vault")}
          className="h-9 px-4 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
        >
          Next: Story Vault ({savedStoriesCount}) <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Chat Card */}
      <Card className="flex-1 border-border/40 flex flex-col min-h-0 overflow-hidden">
        <div ref={chatScrollRef} className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div key={msg.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                  isUser 
                    ? "bg-indigo-600 text-white rounded-br-none" 
                    : "bg-secondary text-foreground rounded-bl-none border border-border/40"
                }`}>
                  {msg.text}
                </div>
                {isUser && (
                  <button
                    onClick={() => handleSaveToVault(msg.text)}
                    className="text-[11px] font-semibold text-indigo-500 hover:underline mt-1 flex items-center gap-1"
                  >
                    <PlusCircle className="h-3 w-3" /> Save Memory to Story Vault
                  </button>
                )}
              </div>
            );
          })}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
              <span>AI Coach is thinking...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-border/40 bg-card/50 flex items-center gap-2 shrink-0">
          <Textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your story or answer here... (Press Enter to send)"
            className="flex-1 text-sm resize-none"
          />
          <Button
            disabled={loading || !input.trim()}
            onClick={handleSend}
            className="h-10 w-10 p-0 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
