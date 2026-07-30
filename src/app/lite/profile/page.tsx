"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, ArrowRight, Save, Check } from "lucide-react";

export default function LiteProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    name: "Student",
    intendedMajor: "",
    colleges: "",
    interests: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const local = localStorage.getItem("essayforge_lite_profile");
    if (local) {
      try {
        setProfile(JSON.parse(local));
      } catch (e) {}
    }
  }, []);

  const handleChange = (field: string, val: string) => {
    const updated = { ...profile, [field]: val };
    setProfile(updated);
    localStorage.setItem("essayforge_lite_profile", JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Step 1 of 6</span>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <User className="h-6 w-6 text-indigo-500" /> Local Student Profile
          </h1>
        </div>
        {saved && (
          <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <Check className="h-3.5 w-3.5" /> Auto-Saved
          </span>
        )}
      </div>

      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="text-lg">Personal Statement Context</CardTitle>
          <CardDescription>
            Enter a few key details to help the AI tailor essay prompts to your background.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g. Alex Morgan"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="major">Intended Major / Academic Interest</Label>
            <Input
              id="major"
              value={profile.intendedMajor}
              onChange={(e) => handleChange("intendedMajor", e.target.value)}
              placeholder="e.g. Computer Science & Design"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="colleges">Target Colleges</Label>
            <Input
              id="colleges"
              value={profile.colleges}
              onChange={(e) => handleChange("colleges", e.target.value)}
              placeholder="e.g. Stanford, MIT, Northwestern"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="interests">Key Activities & Passions</Label>
            <Textarea
              id="interests"
              rows={3}
              value={profile.interests}
              onChange={(e) => handleChange("interests", e.target.value)}
              placeholder="e.g. Robotics team captain, pottery, volunteering at local animal shelter"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              onClick={() => router.push("/lite/interview")}
              className="h-11 px-6 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
            >
              Next: AI Story Interview <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
