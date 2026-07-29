"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Archive, Plus, Trash2, Search, BookOpen, Sparkles, Tag, ArrowRight } from "lucide-react";
import Link from "next/link";

interface StoryItem {
  id: number;
  title: string;
  category: string;
  content: string;
  keyTakeaways: string;
  createdAt: string;
}

export default function StoryVaultPage() {
  const [stories, setStories] = useState<StoryItem[]>([
    {
      id: 1,
      title: "Building the Autonomous Robot Arm",
      category: "Creative Venture",
      content: "After three failed servo motors and countless late nights in the garage, I redesigned the gear system using 3D printed components. The breakthrough came when I simplified the joint mechanics instead of adding more code.",
      keyTakeaways: "Engineering resilience, simplicity over complexity, learning from mechanical failure.",
      createdAt: "2026-07-28"
    },
    {
      id: 2,
      title: "Tutoring Middle School STEM Workshops",
      category: "Community Impact",
      content: "I started a weekend Coding Club at the local public library. On the first day, half the students couldn't get Python to install. I pivoted to visual Scratch programming to keep their enthusiasm alive before introducing text-based code.",
      keyTakeaways: "Adaptability, empathy in teaching, leadership through active listening.",
      createdAt: "2026-07-25"
    },
    {
      id: 3,
      title: "Overcoming Stage Fright at Debate Regionals",
      category: "Personal Growth",
      content: "During sophomore year regionals, my mind went completely blank during a cross-examination. Instead of panicking, I paused, acknowledged the opponent's strong point, and restructured my counter-argument around core principles.",
      keyTakeaways: "Composure under pressure, active listening, turning vulnerability into clarity.",
      createdAt: "2026-07-20"
    }
  ]);

  const [search, setSearch] = useState("");
  const [newStory, setNewStory] = useState({
    title: "",
    category: "Personal Growth",
    content: "",
    keyTakeaways: ""
  });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("essayforge_stories");
    if (saved) {
      try {
        setStories(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved stories:", e);
      }
    }
  }, []);

  const saveStoriesToStorage = (updated: StoryItem[]) => {
    setStories(updated);
    localStorage.setItem("essayforge_stories", JSON.stringify(updated));
  };

  const handleAddStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStory.title || !newStory.content) return;

    const item: StoryItem = {
      id: Date.now(),
      title: newStory.title,
      category: newStory.category,
      content: newStory.content,
      keyTakeaways: newStory.keyTakeaways || "Personal anecdote for application essays",
      createdAt: new Date().toISOString().split("T")[0]
    };

    saveStoriesToStorage([item, ...stories]);
    setNewStory({ title: "", category: "Personal Growth", content: "", keyTakeaways: "" });
    setIsAdding(false);
  };

  const handleDelete = (id: number) => {
    saveStoriesToStorage(stories.filter(s => s.id !== id));
  };

  const filteredStories = stories.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase()) ||
    s.content.toLowerCase().includes(search.toLowerCase())
  );

  const categories = ["Personal Growth", "Community Impact", "Creative Venture", "Academic Challenge", "Leadership"];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Archive className="h-7 w-7 text-amber-500" />
            Story Vault
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Store, tag, and organize your core life experiences and lessons to power your essay brainstorming.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setIsAdding(!isAdding)} className="font-bold shadow-md shadow-primary/20">
            <Plus className="h-4 w-4 mr-2" /> {isAdding ? "Cancel" : "Add New Story"}
          </Button>
        </div>
      </div>

      {/* Add New Story Form Drawer */}
      {isAdding && (
        <Card className="border-indigo-500/30 bg-gradient-to-b from-indigo-950/20 to-card shadow-lg animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              Add Story Entry
            </CardTitle>
            <CardDescription>Capture the vivid details, feelings, and key reflections of this moment.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddStory} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="storyTitle">Story Title</Label>
                  <Input
                    id="storyTitle"
                    value={newStory.title}
                    onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                    placeholder="e.g., Fixing the Community Garden Irrigation"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={newStory.category}
                    onChange={(e) => setNewStory({ ...newStory, category: e.target.value })}
                    className="flex h-11 w-full rounded-xl border border-border/80 bg-background/60 px-4 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="content">Story Narrative & Details</Label>
                <Textarea
                  id="content"
                  value={newStory.content}
                  onChange={(e) => setNewStory({ ...newStory, content: e.target.value })}
                  placeholder="What happened? What obstacle did you face, what actions did you take, and how did you feel?"
                  required
                />
              </div>

              <div>
                <Label htmlFor="takeaways">Key Takeaways & Character Reflection</Label>
                <Input
                  id="takeaways"
                  value={newStory.keyTakeaways}
                  onChange={(e) => setNewStory({ ...newStory, keyTakeaways: e.target.value })}
                  placeholder="What did this teach you about yourself or your values?"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="font-bold">
                  Save to Vault
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stories by keyword, theme, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Story Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredStories.map((story) => (
          <Card key={story.id} className="border-border/60 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <Badge variant="secondary" className="text-xs font-semibold">
                  <Tag className="h-3 w-3 mr-1" /> {story.category}
                </Badge>
                <span className="text-[11px] text-muted-foreground font-medium">{story.createdAt}</span>
              </div>
              <CardTitle className="text-xl font-bold">{story.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 flex-1">
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {story.content}
              </p>
              <div className="p-3 rounded-xl bg-secondary/50 border border-border/40 text-xs">
                <span className="font-bold text-indigo-400">Core Reflection: </span>
                <span className="text-muted-foreground">{story.keyTakeaways}</span>
              </div>
            </CardContent>
            <CardFooter className="pt-3 border-t border-border/40 flex justify-between items-center">
              <Button asChild variant="ghost" size="sm" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
                <Link href="/dashboard/essay-idea-generator">
                  Use in Idea Generator <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(story.id)}
                className="text-muted-foreground hover:text-destructive transition-colors h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}

        {filteredStories.length === 0 && (
          <div className="col-span-full p-12 text-center border border-dashed border-border/60 rounded-3xl space-y-3">
            <Archive className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="font-bold text-lg">No Stories Found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {search ? "No stories matched your search filter." : "Your Story Vault is empty. Add your first story or use the AI Interviewer to discover memories."}
            </p>
            <Button onClick={() => setIsAdding(true)} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1.5" /> Add Story
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}