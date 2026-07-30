import React from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";

export const metadata = {
  title: "EssayForge Pro — Full Admissions Suite",
  description: "Full-featured admissions essay suite with voice preservation, supplemental essay tracking, and deep rubric analytics.",
};

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 md:p-8 animate-page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
