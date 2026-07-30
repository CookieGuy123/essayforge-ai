"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Archive, ArrowRight, Plus, Trash2, BookOpen } from "lucide-react";

interface Story {
  id: string;
  title: string;
  content: string;
  date: string;
}

export default function LiteVaultPage() {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  useEffect(() => {
    const local = localStorage.getItem("essayforge_lite_stories");
    if (local) {
      try {
        setStories(JSON.parse(local));
      } catch (e) {}
    } else {
      // Default initial anecdote example
      const sample = [
        {
          id: "1",
          title: "Overcoming Robot Sensor Malfunction",
          content: "During regionals, our robot's optical sensor failed. Instead of giving up, I rewrote the autonomous loop to rely on wheel encoder counts in 15 minutes.",
          date: new Date().toLocaleDateString()
        }
      ];
      setStories(sample);
      localStorage.setItem("essayforge_lite_stories", JSON.stringify(sample));
    }
  }, []);

  const handleAddStory = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const created: Story = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      content: newContent.trim(),
      date: new Date().toLocaleDateString()
    };
    const updated = [created, ...stories];
    setStories(updated);
    localStorage.setItem("essayforge_lite_stories", JSON.stringify(updated));
    setNewTitle("");
    setNewContent("");
    setShowNew(false);
  };

  const handleDelete = (id: string) => {
    const updated = stories.filter(s => s.id !== id);
    setStories(updated);
    localStorage.setItem("essayforge_lite_stories", JSON.stringify(updated));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Step 3 of 6</span>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Archive className="h-6 w-6 text-indigo-500" /> Story Vault
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowNew(!showNew)}
            variant="outline"
            className="h-9 text-xs font-semibold border-border/40"
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Story
          </Button>
          <Button
            onClick={() => router.push("/lite/ideas")}
            className="h-9 px-4 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
          >
            Next: Generate Essay Ideas <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Add New Story Form */}
      {showNew && (
        <Card className="border-indigo-500/30 bg-indigo-500/5">
          <CardContent className="p-4 space-y-3">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Story Title (e.g. Fixing the Engine)"
              className="text-sm font-bold"
            />
            <Textarea
              rows={3}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Describe what happened, what you felt, and what you learned..."
              className="text-sm"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowNew(false)}>Cancel</Button>
              <Button size="sm" onClick={handleAddStory} className="bg-indigo-600 text-white font-bold">
                Save Story
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Story List */}
      <div className="space-y-3">
        {stories.map((story) => (
          <Card key={story.id} className="border-border/40 hover:border-indigo-500/30 transition-colors">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-500" />
                {story.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">{story.date}</span>
                <button
                  onClick={() => handleDelete(story.id)}
                  className="text-muted-foreground hover:text-red-500 p-1 transition-colors"
                  title="Delete story"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {story.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
