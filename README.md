# 🎓 EssayForge AI

> **100% Local-First, Privacy-Preserving College Admissions Essay Coach**  
> Powered by Next.js 15, Drizzle SQLite, and your local **LM Studio** AI engine.

![EssayForge AI Banner](https://img.shields.io/badge/Privacy-100%25%20Local-emerald?style=for-the-badge&logo=shield)
![Next.js 15](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)
![LM Studio](https://img.shields.io/badge/AI-LM%20Studio%20(Local)-indigo?style=for-the-badge&logo=cpu)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

---

## 🌟 Overview

**EssayForge AI** helps high school applicants brainstorm, draft, refine, and evaluate authentic college application essays without giving up their personal data to cloud AI providers.

Unlike traditional AI tools that rewrite essays into stiff, corporate-sounding text, EssayForge AI features a **Voice Preservation Studio** to guard your authentic writing style and an **8-Metric Admissions Rubric Analyzer** to evaluate your drafts as a senior college admissions officer would.

---

## ✨ Key Features

### 🛡️ Voice Preservation Studio (`/dashboard/voice-profile`) — *CORE*
- Analyzes authentic samples of your prior writing (past school papers, journal entries, emails).
- Extracts sentence rhythm, vocabulary level, tone markers, and rhetorical style.
- Establishes a local **Voice Profile Directive** that prevents AI tools from replacing your authentic voice with generic SAT words.

### 📊 8-Metric Essay Admissions Analyzer (`/dashboard/essay-analyzer`) — *CORE*
Evaluates drafts across 8 admissions rubric criteria:
1. **Authenticity & Personal Voice**
2. **Depth of Self-Reflection**
3. **Sensory Specificity & Detail**
4. **Storytelling & Narrative Arc**
5. **Emotional Impact**
6. **Structural Flow**
7. **Grammar & Mechanics**
8. **Common App / University Prompt Alignment**
- Provides an **Overall Fit Score (/100)**, visual radar breakdowns, line-by-line observations, and actionable coaching tips.

### 🎙️ AI Story Discovery Interviewer (`/dashboard/ai-interview`)
- Probing Q&A coach that helps uncover forgotten anecdotes, challenges overcome, and core values.
- One-click **"Save Story Insight"** button exports discovered memories straight to your Story Vault.

### 🗃️ Story Vault (`/dashboard/story-vault`)
- Categorize, tag, search, and store raw anecdotes by theme (*Personal Growth*, *Leadership*, *Community Impact*).

### 💡 Essay Idea Generator (`/dashboard/essay-idea-generator`)
- Brainstorms 3 distinct essay concepts complete with originality scores, cliché risk warnings, hooks, and outlines.
- One-click **"Create Essay From This Idea"** instantiates a new draft in the workspace.

### ✍️ Essay Workspace (`/dashboard/essay-workspace`)
- Editor with real-time word count progress bars, prompt selector, version history snapshot manager, and **7 targeted AI coaching tools** (*Show Don't Tell*, *Reflection*, *Remove Clichés*, *Clarity*, *Transitions*, *Grammar*, *Preserve Voice*).

### 🎨 Dark & Light Theme Customizer
- Instant theme toggle and persistent dark/light mode with zero-flash (FOUC) head initialization.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Actions, Client Components)
- **Styling**: Tailwind CSS & Vanilla CSS Design Tokens
- **Icons**: Lucide React
- **Database**: SQLite via [Drizzle ORM](https://orm.drizzle.team/)
- **Local AI Engine**: [LM Studio](https://lmstudio.ai/) (OpenAI-compatible API at `http://127.0.0.1:1234/v1`)

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
1. Install **Node.js** (v18+) or **Deno** (v2+).
2. Download and install **[LM Studio](https://lmstudio.ai/)**.

### Step 1: Start LM Studio
1. Launch **LM Studio**.
2. Download a model (Recommended: *Llama-3*, *Qwen-2.5*, *Gemma-2B/7B*, or *Mistral-7B*).
3. Go to the **Local Server** tab (server icon on left).
4. Click **Start Server** at port `1234` (`http://127.0.0.1:1234`).

### Step 2: Clone & Install Dependencies

```bash
# Clone repository
git clone https://github.com/CookieGuy123/essayforge-ai.git
cd essayforge-ai

# Install dependencies
npm install
```

### Step 3: Run Development Server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🌐 Deploying to Vercel & Remote Access

### How LM Studio Works with Vercel

1. **Local Access (Default)**:
   - When you host the app on Vercel and open it from your local computer, the Next.js proxy queries `http://127.0.0.1:1234/v1` on your machine. Your essay data stays 100% local.

2. **Remote Access (From Phone or Away from Home)**:
   - If you want your Vercel deployment to connect to your home PC's LM Studio instance when you're away from home:
   - Run a free tunnel on your home PC:
     ```bash
     ngrok http 1234
     ```
   - In your **Vercel Dashboard** $\rightarrow$ **Settings** $\rightarrow$ **Environment Variables**, set:
     ```env
     LM_STUDIO_URL=https://your-ngrok-subdomain.ngrok-free.app/v1
     ```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
