# EssayForge AI Project Context

## Project Overview
EssayForge AI is a local-first AI college admissions essay coach built with Next.js 15, SQLite, and LM Studio.

## Key Implementation Details
- Local AI: LM Studio server running at http://localhost:1234/v1
- Database: SQLite with Drizzle ORM schema
- Frontend: Next.js App Router + TypeScript + Tailwind CSS + Lucide Icons
- Essay Editor & Coaching: Workspace editor with real-time word counting, prompt alignment, and local AI coaching
- No cloud dependencies: 100% offline privacy

## MVP Feature Implementation Status
- [x] Landing page (`/`)
- [x] Dashboard Hub (`/dashboard`)
- [x] Local profile system (`/dashboard/profile`)
- [x] AI Interview feature (`/dashboard/ai-interview`)
- [x] Story Vault implementation (`/dashboard/story-vault`)
- [x] Essay Idea Generator (`/dashboard/essay-idea-generator`)
- [x] Essay Workspace editor (`/dashboard/essay-workspace`)
- [x] Essay Analyzer tool (`/dashboard/essay-analyzer`)
- [x] LM Studio status monitoring (`/dashboard/lm-studio-status`)