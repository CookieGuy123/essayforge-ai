"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Save, CheckCircle2, GraduationCap, Sparkles } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "Alex Morgan",
    gradeLevel: "High School Senior",
    colleges: "Stanford, UC Berkeley, MIT, Northwestern",
    intendedMajor: "Computer Science & Symbolic Systems",
    interests: "Robotics, Open Source Software, Mechanical Engineering, Philosophy",
    extracurriculars: "Captain of Robotics Team (3 yrs), STEM Tutor at Public Library, Track & Field",
    deadlines: "Stanford (Nov 1 EA), UC Berkeley (Nov 30), MIT (Jan 1 RD)",
    bio: "Passionate about building intuitive software, robotics club captain, and volunteering at local community tech workshops.",
    personalThemes: "Resilience through trial and error, cross-disciplinary curiosity, community empowerment",
    voicePreferences: "Conversational yet reflective, vivid storytelling, authentic without sounding overly formal"
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem("essayforge_profile");
    if (savedData) {
      try {
        setProfile(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to load profile:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const updateProfile = (key: string, value: string) => {
    setProfile(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem("essayforge_profile", JSON.stringify(updated));
      return updated;
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("essayforge_profile", JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  if (!isLoaded) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <User className="h-7 w-7 text-indigo-500" />
            Local Student Profile
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your profile details auto-save locally to your browser and personalize all AI coaching features.
          </p>
        </div>
        {saved && (
          <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 font-semibold text-sm animate-fade-in flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Auto-Saved!
          </Badge>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-400" />
              Basic Identity & Applications
            </CardTitle>
            <CardDescription>Core student identity, grade level, and target schools.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => updateProfile("name", e.target.value)}
                  placeholder="e.g., Alex Morgan"
                  required
                />
              </div>

              <div>
                <Label htmlFor="gradeLevel">Grade Level</Label>
                <select
                  id="gradeLevel"
                  value={profile.gradeLevel}
                  onChange={(e) => updateProfile("gradeLevel", e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-border/80 bg-card dark:bg-slate-900/90 text-foreground px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs"
                >
                  <option value="High School Senior">High School Senior (12th)</option>
                  <option value="High School Junior">High School Junior (11th)</option>
                  <option value="Gap Year Student">Gap Year Student</option>
                  <option value="Transfer Student">Transfer Student</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="colleges">Target Colleges</Label>
                <Input
                  id="colleges"
                  value={profile.colleges}
                  onChange={(e) => updateProfile("colleges", e.target.value)}
                  placeholder="e.g., Stanford, MIT, Harvard, UC Berkeley"
                />
              </div>

              <div>
                <Label htmlFor="intendedMajor">Intended Major / Field</Label>
                <Input
                  id="intendedMajor"
                  value={profile.intendedMajor}
                  onChange={(e) => updateProfile("intendedMajor", e.target.value)}
                  placeholder="e.g., Computer Science, Bioengineering"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="interests">Key Academic & Personal Interests</Label>
                <Input
                  id="interests"
                  value={profile.interests}
                  onChange={(e) => updateProfile("interests", e.target.value)}
                  placeholder="e.g., Robotics, Philosophy, Sustainable Energy"
                />
              </div>

              <div>
                <Label htmlFor="deadlines">Application Deadlines</Label>
                <Input
                  id="deadlines"
                  value={profile.deadlines}
                  onChange={(e) => updateProfile("deadlines", e.target.value)}
                  placeholder="e.g., Stanford Nov 1, UC Nov 30, MIT Jan 1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="extracurriculars">Extracurricular Activities & Leadership</Label>
              <Textarea
                id="extracurriculars"
                value={profile.extracurriculars}
                onChange={(e) => updateProfile("extracurriculars", e.target.value)}
                placeholder="List key leadership roles, clubs, sports, or work experience..."
                className="min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              Writing Voice & Character Themes
            </CardTitle>
            <CardDescription>Guides AI tools to align coaching with your authentic voice.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="personalThemes">Core Values & Personal Themes</Label>
              <Input
                id="personalThemes"
                value={profile.personalThemes}
                onChange={(e) => updateProfile("personalThemes", e.target.value)}
                placeholder="e.g., Resilience, intellectual curiosity, leadership, community service"
              />
            </div>

            <div>
              <Label htmlFor="voicePreferences">Writing Style & Tone Preferences</Label>
              <Textarea
                id="voicePreferences"
                value={profile.voicePreferences}
                onChange={(e) => updateProfile("voicePreferences", e.target.value)}
                placeholder="e.g., Reflective, conversational, humorous, direct, introspective..."
                className="min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="submit" size="lg" className="px-8 font-bold shadow-md shadow-primary/20 bg-indigo-600 text-white hover:bg-indigo-500">
            <Save className="h-4 w-4 mr-2" /> Save Local Profile
          </Button>
        </div>
      </form>
    </div>
  );
}