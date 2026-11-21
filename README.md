# 🌌 ConstellationEd

> **Adaptive Exam-Prep Tutor with a Deep Cognitive Learner Model**  
> *Target Syllabus: Class 10 Physics — Chapter: "Electricity" (CBSE / NCERT)*

ConstellationEd shifts the paradigm from standard test-prep tools that merely tally right and wrong answers to an **evidence-based cognitive tutor**. It models what a student actually understands using **Bayesian Knowledge Tracing (BKT)**, diagnoses flawed mental models from **student-typed reasoning**, schedules retention with **SM-2 spaced repetition**, and visualizes the student's mastery as a living, breathing **night sky constellation**.

---

## 📌 Problem Statement

Traditional ed-tech platforms and exam-prep apps suffer from a fundamental cognitive blind spot:
1. **They track answers, not understanding:** If a student guesses correctly, standard apps assume mastery. If a student makes an arithmetic slip on an Ohm's Law problem, standard apps assume they don't understand current.
2. **Invisible Misconceptions:** In physics, students don't fail because their minds are empty; they fail because they have deeply held, intuitive, incorrect mental models (e.g., *"current is consumed inside a light bulb like fuel"* or *"a 9V battery always outputs the same current regardless of what is plugged in"*). Multiple-choice questions alone cannot distinguish an honest calculation error from a deep conceptual bug.
3. **No Prerequisite Accountability:** Failure on advanced synthesis concepts (like equivalent resistance or Joule heating) should update confidence in foundational prerequisites (electric charge, potential difference, Ohm's law). Standard quiz apps isolate every question as an independent silo.
4. **Forgetting Is Ignored:** Memorized formulas fade within days unless reinforced at mathematically optimal intervals.

**ConstellationEd solves this:**
- Visualizes mastery as **star brightness** in a dark cosmic sky.
- Propagates mastery bidirectionally across a **29-concept Directed Acyclic Graph (DAG)**.
- Diagnoses mental model bugs from **mandatory typed student reasoning** and displays them as **pulsating red solar flares**.
- Repairs misconceptions through targeted **counter-example challenge questions** that physically disprove the false intuition.
- Preserves long-term memory with **SM-2 spaced repetition** and Ebbinghaus forgetting curve retention decay.

---

## 🏆 Hackathon Feature Checklist

| Hackathon Requirement | ConstellationEd Implementation | Status |
| :--- | :--- | :---: |
| **1. Concept Graph** | 29 Class 10 Electricity concepts in `/data/concepts.json` spanning 7 pedagogical clusters with complete prerequisite DAG edges. | ✅ Complete |
| **2. Diagnostic Test** | 8–12 questions adaptive engine minimizing Shannon entropy ($H(p)$), early stopping on variance convergence, mandatory 1-line typed reasoning. | ✅ Complete |
| **3. Learner Model** | 4-parameter BKT ($P(L_0), T, s, g$), bidirectional prerequisite propagation, live dynamic Predicted Exam Score gauge. | ✅ Complete |
| **4. Question Generation & Calibration** | LLM-generated questions targeting 70% success probability, dynamic difficulty calibration (1–5), 100% deterministic fallback in `/data/questions.json`. | ✅ Complete |
| **5. Misconception Detection** | 14 curated physics bugs in `/data/misconceptions.json`, LLM reasoning inspection extracting verbatim quotes, counter-example repair challenges that extinguish red solar flares. | ✅ Complete |
| **6. Spaced Repetition** | SM-2 scheduling ($I(n) = I(n-1) \times EF$), celestial retention decay ($L(t)$), amber review pulsing, dynamic session queue blending due + weakest concepts. | ✅ Complete |
| **7. Student View (`/student`)** | Interactive cosmic sky canvas, star halos, red solar flares, star inspector drawer, predicted score HUD, mental bug cards, counter-example modal. | ✅ Complete |
| **8. Teacher Dashboard (`/teacher`)** | 30-student simulated cohort, 30×29 heatmap with sticky headers/columns, bug icons with quote tooltips, ranked class gaps, AI suggested lesson plan with counter-experiment. | ✅ Complete |
| **9. Polish & 3-Min Demo Mode** | Cosmic dark aesthetic, smooth SVG animations, fast-forward demo seeding button for rapid 3-minute hackathon judging. | ✅ Complete |

---

## 🏛️ System Architecture

ConstellationEd is built on **Next.js 14 (App Router)** with a modular architecture separating mathematical cognition engines, resilient LLM providers, and reactive UI components:

```
constellation-ed/
├── app/
│   ├── api/
│   │   ├── diagnostic/
│   │   │   ├── start/route.ts       # Initializes adaptive diagnostic session
│   │   │   └── answer/route.ts      # BKT update + prerequisite cascade + next question
│   │   ├── misconception/
│   │   │   └── resolve/route.ts     # Counter-example verification & flare extinguish
│   │   ├── practice/
│   │   │   └── generate/route.ts    # Calibrated question generation (LLM + Fallback)
│   │   ├── student/
│   │   │   └── session-queue/route.ts # Blended SM-2 review queue & star luminosities
│   │   ├── teacher/
│   │   │   └── analytics/route.ts   # Cohort aggregation, heatmap, AI lesson plan
│   │   └── demo/
│   │       └── fast-forward/route.ts# Instant state accelerator for demo flow
│   ├── student/page.tsx             # Student Sky UI, Star Inspector & Bug Cards
│   ├── teacher/page.tsx             # Teacher Matrix Heatmap & Class Analytics
│   └── page.tsx                     # Landing redirect to /student
├── components/
│   ├── ConstellationCanvas.tsx      # SVG star sky with glows, flares & prerequisite lines
│   ├── StarInspectorDrawer.tsx      # Slide-over showing concept mastery & prerequisites
│   ├── PredictedScoreGauge.tsx      # Live animated radial exam prediction gauge
│   ├── MisconceptionCards.tsx       # "Bug Found" cards with counter-example triggers
│   ├── CounterExampleModal.tsx      # Interactive counter-intuitive repair challenges
│   ├── DiagnosticModal.tsx          # Adaptive diagnostic test runner with reasoning
│   ├── PracticeModal.tsx            # Targeted concept practice modal
│   └── Navbar.tsx                   # Top navigation with 3-Min Demo trigger
├── data/
│   ├── concepts.json                # 29 concepts DAG with difficulty & explanations
│   ├── misconceptions.json          # 14 physics misconceptions with counter-examples
│   ├── questions.json               # 30+ calibrated questions with misconception tags
│   └── store.json                   # Typed local JSON database store
├── lib/
│   ├── bkt.ts                       # Bayesian Knowledge Tracing & Prerequisite cascades
│   ├── sm2.ts                       # SuperMemo SM-2 & Ebbinghaus forgetting curve
│   ├── exam-score.ts                # Board exam score prediction model
│   ├── diagnostic.ts                # Shannon entropy question selection & early stopping
│   ├── llm.ts                       # Multi-provider LLM (Gemini/OpenAI) + Fallbacks
│   ├── db.ts                        # Atomic database store accessor
│   └── seed-teacher.ts              # 30-student simulated cohort with 4 archetypes
└── tests/
    ├── bkt.test.ts                  # Unit tests for BKT updates & propagation
    └── sm2.test.ts                  # Unit tests for SM-2 intervals & forgetting curve
```

---

## 🧠 How the Learner Model Works

### 1. Bayesian Knowledge Tracing (BKT)
Every concept $c$ for each student maintains a latent mastery probability $P(L_c) \in [0.01, 0.99]$.
The model uses standard 4-parameter BKT:
- **$P(L_0) = 0.20$**: Prior probability of knowing the concept before practice.
- **$T = 0.15$**: Transition probability (probability of learning the concept on this trial).
- **$s = 0.10$**: Slip probability (student knows the concept but makes a careless slip).
- **$g = 0.25$**: Guess probability (student doesn't know, but guesses correctly on a 4-option question).

#### Update Rule
Upon observing an answer $O_t \in \{0, 1\}$:

**If correct ($O_t = 1$):**
$$P(L_t \mid O_t = 1) = \frac{P(L_t)(1 - s)}{P(L_t)(1 - s) + (1 - P(L_t))g}$$

**If incorrect ($O_t = 0$):**
$$P(L_t \mid O_t = 0) = \frac{P(L_t) \cdot s}{P(L_t) \cdot s + (1 - P(L_t))(1 - g)}$$

**Transition Step:**
$$P(L_{t+1}) = P(L_t \mid O_t) + (1 - P(L_t \mid O_t)) \cdot T$$

---

### 2. Bidirectional Prerequisite Propagation
Concepts are linked in a Directed Acyclic Graph (e.g., `electric_charge` $\rightarrow$ `electric_current` $\rightarrow$ `potential_difference` $\rightarrow$ `ohms_law` $\rightarrow$ `series_circuits`).

```
[Electric Charge] ──> [Electric Current] ──> [Potential Difference]
                                │                      │
                                └───> [Ohm's Law] <────┘
                                           │
                                ┌──────────┴──────────┐
                                ▼                     ▼
                       [Series Circuits]     [Parallel Circuits]
```

When a student answers a question on concept $C$:
- **Downstream Failure Dampens Upstream Prerequisites ($\gamma = 0.35$):**  
  If a student fails on *Ohm's Law*, their probability of mastering upstream foundations (*Electric Current*, *Potential Difference*) is dampened proportionally:
  $$P(L_{\text{prereq}})_{\text{new}} = P(L_{\text{prereq}}) \cdot \left[1 - \gamma \cdot (1 - P(L_C))\right]$$
- **Upstream Success Reinforces Prerequisites ($\gamma_{\text{boost}} = 0.15$):**  
  Correctly applying Ohm's Law validates mastery in foundational prerequisites:
  $$P(L_{\text{prereq}})_{\text{new}} = P(L_{\text{prereq}}) + (1 - P(L_{\text{prereq}})) \cdot \gamma_{\text{boost}} \cdot P(L_C)$$

---

### 3. Spaced Repetition (SM-2) & Celestial Forgetting Curve
Every concept tracks review scheduling via the **SuperMemo-2 (SM-2)** algorithm:
- Initial interval $I(1) = 1$ day; second interval $I(2) = 6$ days.
- Subsequent intervals: $I(n) = I(n-1) \times EF$.
- Ease Factor update:
  $$EF' = EF + (0.1 - (5 - q) \cdot (0.08 + (5 - q) \cdot 0.02)), \quad EF' \ge 1.30$$
  where $q \in \{1, 3, 5\}$ is recall quality derived from answer accuracy and response time.

#### Celestial Forgetting Curve
Over elapsed time $t$ (days), star luminosity $L(t)$ dims according to the Ebbinghaus retention curve:
$$L(t) = P(L) \cdot \left(0.40 + 0.60 \cdot e^{-t / S}\right)$$
where $S$ is memory stability derived from repetition count and ease factor. Stars that are due for review ($t \ge \text{interval}$) dim and pulse softly with an **amber aura**, alerting the student to review.

---

### 4. Shannon Entropy Adaptive Diagnostic
The diagnostic engine selects the next question by maximizing **Shannon Entropy (uncertainty)**:
$$H(p) = -p \log_2 p - (1-p) \log_2 (1-p)$$
It selects the concept closest to $P(L) = 0.50$ (maximum cognitive ambiguity) among concepts whose prerequisites have been at least partially explored.
- **Early Stopping:** If the standard deviation of mastery across the syllabus drops below $\sigma \le 0.45$ after question 8, or at the maximum cap of 12 questions, the test halts with a converged profile.

---

## 🔍 How Misconception Detection Works

Misconception detection is the **core differentiator** of ConstellationEd. Rather than guessing intentions from an option click, ConstellationEd analyzes the student's **typed natural language reasoning**.

```
[Student Answers Question]
            │
            ▼
[Mandatory 1-Line Typed Reasoning: "Why did you pick this?"]
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│                       lib/llm.ts                            │
│  - Evaluates: (Question, Chosen Option, Typed Reasoning)    │
│  - Compares against 14 Known Physics Misconceptions         │
│  - Extracts: { misconception_id, quote, explanation }       │
│  - 100% Deterministic Fallback if API offline               │
└─────────────────────────────────────────────────────────────┘
            │
            ▼
[Misconception Detected?]
   ├── YES ──> [Erupt Red Solar Flare on Star in Sky]
   │           [Generate "Mental Model Bug Card"]
   │           [Serve Targeted Counter-Example Challenge]
   │                 │ (Student solves challenge)
   │                 ▼
   │           [Extinguish Flare + Restore Star Luminosity + Confetti]
   │
   └── NO  ──> [Standard BKT Mastery Update]
```

### 1. Mandatory Student Reasoning
After selecting an option, the student cannot proceed without answering:  
*"Why did you pick this option? Explain your thinking in one sentence."*

### 2. Multi-Provider LLM with Strict JSON & Fallback
The reasoning text is dispatched to `lib/llm.ts`:
- Prompted with a curated library of **14 Class 10 misconceptions** (from `/data/misconceptions.json`), including:
  - `misc_current_consumed`: *"Current is consumed or used up by the bulb like fuel."*
  - `misc_battery_constant_current`: *"A battery pushes a fixed, constant current into any circuit."*
  - `misc_resistance_flow_more`: *"Higher resistance attracts more current because it needs more power."*
  - `misc_series_parallel_same_brightness`: *"Bulbs in series have the same brightness as bulbs in parallel because the battery is the same."*
  - `misc_parallel_resistance_adds`: *"Adding parallel resistors increases total resistance because there are more resistors."*
  - `misc_electron_speed_light`: *"Electrons travel at the speed of light through the wire."*
- Returns structured JSON: `{ misconception_id, confidence, evidence_quote_from_reasoning, explanation }`.
- **Deterministic Offline Resilience:** If the API key is unset or the external API fails, the system executes an offline pattern matcher against option distractor keys and reasoning keywords. **The demo never breaks.**

### 3. Cognitive Repair via Counter-Examples
When a bug is diagnosed:
1. The concept star in the sky erupts with a **pulsating red solar flare**.
2. A **Mental Model Bug Card** appears on the student dashboard detailing:
   - What the student believes
   - The verbatim quote extracted from their reasoning
   - Why that intuition feels true
   - The physical contradiction
3. The student clicks **"Fix Bug via Counter-Example"** to launch a concrete thought-experiment (e.g., the *Twin Ammeter Test* showing identical current entering and exiting a filament).
4. Answering correctly repairs the mental model, extinguishes the red flare, and logs the bug as resolved.

---

## 👩‍🏫 Teacher Dashboard

The Teacher Dashboard (`/teacher`) provides classroom-level cognitive diagnostics:
- **Matrix Heatmap (30 Students × 29 Concepts):** Color-coded by mastery probability $P(L)$. Features two-way sticky scrolling (header row and student name column stay locked).
- **Active Bug Icons:** Cells where students have an unresolved misconception display a pulsing `<Bug />` icon; hovering reveals the student's verbatim quote and misconception title.
- **Ranked Class Gaps:** Automatically sorts the 29 concepts from lowest to highest class average mastery to spotlight immediate bottlenecks.
- **Top Shared Misconceptions:** Shows class prevalence (e.g., *"17 of 30 students believe current is used up in a bulb"*).
- **AI Suggested Lesson Plan for Tomorrow:** Generates a complete 45-minute inquiry-based lesson plan targeting the top 3 gaps and top shared misconception, complete with hands-on counter-experiments and discussion prompts.
- **Student Drill-Down:** Clicking any concept or misconception displays the exact roster of students who need targeted intervention.

> [!NOTE]  
> **Simulated Data Notice:** The Teacher Dashboard uses a realistic **30-student simulated cohort** (`Class 10-A (Simulated Data)`) seeded with 4 realistic learner archetypes (High Achievers, Typical Learners, Misconception-Prone, Foundational Strugglers) and 4 misconception clusters. This allows evaluators to explore realistic class-wide analytics immediately without needing 30 individual test sessions. Click **"Reseed Cohort"** in the teacher header to regenerate random distributions at any time.

---

## ⚡ 3-Minute Demo Walkthrough for Judges

To experience the complete product flow in under 3 minutes:

1. **Open the Student Sky:**  
   Navigate to **[http://localhost:3000/student](http://localhost:3000/student)**.
2. **Click "Demo Mode (3 min)":**  
   Click the **Demo Mode (3 min)** button in the top navigation bar. This fast-forwards the learner state with realistic star brightnesses, two active red solar flares, and due reviews.
3. **Inspect the Constellation:**  
   Notice that stars for mastered concepts glow bright cyan/gold, while unmastered stars are dim. Notice the two stars with **pulsating red flares** (*Electric Current* and *Ohm's Law*).
4. **Inspect a Star:**  
   Click on the **"Electric Current"** star. The slide-over inspector shows its BKT mastery ($P(L) = 0.42$), prerequisite dependencies, and review schedule.
5. **Repair a Mental Model Bug:**  
   Scroll down to the **"Detected Mental Model Bugs"** section. Click **"Fix Bug via Counter-Example"** on the *"Current is Consumed in a Bulb"* card.
6. **Solve the Counter-Example:**  
   Read the *Twin Ammeter* setup. Select **Option B** (*"Both ammeters read identical values because charge is conserved"*). Submit the repair.  
   *Watch the celebration confetti fire and see the red flare extinguish into a bright star!*
7. **Run Adaptive Diagnostic Practice:**  
   Click **"Start Today's Session"** to experience the adaptive diagnostic question runner. Enter your answer and type your one-line reasoning to see live BKT updates.
8. **Explore the Teacher Hub:**  
   Click **"Teacher Hub"** in the top navigation (**[http://localhost:3000/teacher](http://localhost:3000/teacher)**).  
   - Inspect the sticky 30×29 student heatmap.
   - Hover over cells with the `<Bug />` icon to see student reasoning quotes.
   - Click a concept under **"Ranked Class Gaps"** to see which students need help.
   - Review the **AI Suggested Lesson Plan** for tomorrow's class.

---

## 🛠️ Setup & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher (tested on Node v20 & v24)
- **npm**: v9.0.0 or higher

### 1. Clone & Install
```bash
git clone https://github.com/your-username/constellation-ed.git
cd constellation-ed
npm install
```

### 2. Configure Environment Variables (Optional)
ConstellationEd is **100% functional offline** with built-in deterministic fallbacks. To enable live LLM question generation and reasoning analysis with Gemini or OpenAI:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Google Gemini API Key (Recommended)
GEMINI_API_KEY=your_gemini_api_key_here

# Or OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# LLM Provider choice ("gemini" | "openai")
LLM_PROVIDER=gemini
```

### 3. Run Unit Tests
Validate the learner model, BKT calculations, prerequisite cascades, SM-2 intervals, and forgetting curves:
```bash
npm test
```
*Expected output: `tests 12, pass 12, fail 0`.*

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser (automatically redirects to `/student`).

---

## 🚀 Deploying to Vercel

ConstellationEd is fully configured for zero-configuration, seamless deployment on **Vercel** serverless environments:

### 1. Push to GitHub
```bash
git add .
git commit -m "Deploy ConstellationEd"
git push origin main
```

### 2. Import Project into Vercel
1. Go to [vercel.com/new](https://vercel.com/new) and select your repository.
2. Framework Preset: **Next.js** (auto-detected).
3. Root Directory: `./` (leave default).

### 3. Environment Variables on Vercel
All environment variables are **optional** because ConstellationEd includes complete deterministic question banks and misconception repair engines:

| Variable | Description | Required? | Default / Fallback |
| :--- | :--- | :---: | :--- |
| `GEMINI_API_KEY` | Google Gemini API key for live question generation and reasoning analysis. | **No** (Optional) | Falls back to offline question bank & deterministic detector in `/data`. |
| `OPENAI_API_KEY` | OpenAI API key (alternative to Gemini). | **No** (Optional) | Falls back to offline question bank & deterministic detector in `/data`. |
| `LLM_PROVIDER` | Preferred LLM provider (`"gemini"` or `"openai"`). | **No** (Optional) | `"gemini"` |

### 4. Serverless Resilience & Storage
- **Read-Only Root Filesystem Handling**: In Vercel serverless functions, the root filesystem is read-only. ConstellationEd uses a hybrid storage strategy:
  1. **In-Memory Global Singleton (`globalThis`)**: Maintains instant state updates across API requests during container lifetime.
  2. **Writable `/tmp` Storage**: Detects Vercel (`process.env.VERCEL`) and directs filesystem writes to `os.tmpdir()` (`/tmp/constellation_store.json`), preventing `EROFS` crashes.
  3. **Bundled Seed Fallback**: Reads the bundled `data/store.json` (30 simulated students + demo student) on cold starts.
  4. **Strict Dynamic Serverless API**: All API routes export `export const dynamic = "force-dynamic"`, eliminating static pre-render errors during `next build`.
- **Offline / Zero-Key Demo Guarantee**: Even if deployed with no API keys configured, all features (Adaptive Diagnostic, Counter-Example Repairs, 3-Minute Fast-Forward Demo, Teacher Heatmap, AI Lesson Plan fallback) remain 100% interactive.

---

## 🧪 Unit Test Coverage

The test suite in `/tests` directly validates core cognitive algorithms:

| Test Case | Module | What It Verifies |
| :--- | :--- | :--- |
| `BKT - correct answer` | `lib/bkt.ts` | $P(L)$ increases upon correct response accounting for slip/guess. |
| `BKT - incorrect answer` | `lib/bkt.ts` | $P(L)$ decreases upon incorrect response accounting for slip/guess. |
| `BKT - consecutive correct` | `lib/bkt.ts` | Repeated successes converge toward asymptote ($P(L) \to 0.99$). |
| `BKT - boundary clamping` | `lib/bkt.ts` | Values are strictly clamped within $[0.01, 0.99]$. |
| `BKT - downstream failure cascade` | `lib/bkt.ts` | Failing downstream concepts dampens upstream prerequisite confidences. |
| `BKT - downstream success boost` | `lib/bkt.ts` | Solving downstream concepts reinforces prerequisite masteries. |
| `SM-2 - initial recall` | `lib/sm2.ts` | First quality review produces an interval of 1 day. |
| `SM-2 - second repetition` | `lib/sm2.ts` | Second successful repetition expands interval to 6 days. |
| `SM-2 - ease factor scaling` | `lib/sm2.ts` | Subsequent intervals scale by ease factor ($I(n) = I(n-1) \times EF$). |
| `SM-2 - failed recall reset` | `lib/sm2.ts` | Failing recall resets repetition count to 0 and interval to 1. |
| `SM-2 - ease factor floor` | `lib/sm2.ts` | Ease factor is never permitted to drop below $1.30$. |
| `Forgetting Curve decay` | `lib/sm2.ts` | Luminosity decays exponentially with elapsed time following Ebbinghaus retention. |

---

## 📄 License
MIT License. Built with ❤️ for the Hackathon.
