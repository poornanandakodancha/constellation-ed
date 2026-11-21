# 🌌 ConstellationEd

> **Adaptive Exam-Prep Tutor with a Deep Cognitive Learner Model**  
> *Syllabus: Class 10 Physics — Chapter: "Electricity"*

ConstellationEd visualizes a student's cognitive state as a **living night sky**. Every concept is a star whose brightness reflects empirical mastery probability. Prerequisite dependencies are glowing constellation lines. Active conceptual misconceptions erupt as **pulsating red solar flares**, and forgetting curve decay causes stars to dim and pulse softly until reviewed with **SM-2 spaced repetition**.

---

## 🚀 Key Features

### 1. 🌟 Concept Graph (29 Concepts DAG)
- Complete coverage of CBSE / NCERT Class 10 Physics (*Electricity*).
- Spans 7 pedagogical clusters:
  1. **Electrostatics & Charge** (`electric_charge`, `conductors_insulators`, `coulombs_law_concept`)
  2. **Electric Current & Circuit** (`electric_current`, `electric_circuit`, `ammeter_measurement`, `drift_velocity_electron_flow`)
  3. **Potential Difference** (`electric_potential`, `potential_difference`, `voltmeter_measurement`, `cell_and_emf`)
  4. **Ohm's Law & Resistance** (`ohms_law`, `v_i_graph`, `electrical_resistance`, `factors_affecting_resistance`, `resistivity`, `temperature_dependence`)
  5. **Series & Parallel Combinations** (`series_circuits`, `series_equivalent_resistance`, `parallel_circuits`, `parallel_equivalent_resistance`, `series_vs_parallel_comparison`)
  6. **Heating Effect & Energy** (`joules_law_of_heating`, `heating_applications`, `electric_energy_kwh`)
  7. **Electric Power & Domestic Safety** (`electric_power_formulas`, `bulb_power_ratings`, `electric_fuse_safety`, `domestic_wiring_earthing`)

### 2. 🧠 Bayesian Knowledge Tracing (BKT) with Prerequisite Cascades
- Implements standard 4-parameter BKT ($P(L_0), T, s, g$) with slip probability ($s = 0.10$) and guess probability ($g = 0.25$).
- **Bidirectional Prerequisite Propagation**:
  - A failure on an advanced topic like *Ohm's Law* dampens confidence in foundational prerequisites (*Electric Current*, *Potential Difference*) proportionally ($\gamma = 0.35$).
  - Solving advanced topics reinforces foundations ($\gamma_{\text{boost}} = 0.15$).
- **Live Predicted Exam Score**: Computes weighted exam board percentage based on concept difficulty weights and confidence intervals.

### 3. 🎯 Adaptive Diagnostic Test
- Dynamically selects the next question maximizing **Shannon entropy / uncertainty** ($H(p) = -p \log_2 p - (1-p) \log_2 (1-p)$), targeting $P(L) \approx 0.50$.
- **Early Stopping**: Halts between 8 and 12 questions when the model achieves confidence convergence ($\sigma^2 \le 0.45$).
- **Mandatory Typed Reasoning**: Students must explain *"Why did you pick this?"* after every answer to expose their mental model.

### 4. 🔴 Misconception Detection & Repair (The Core Differentiator)
- Catalog of **14 verified physics misconceptions** in `/data/misconceptions.json`:
  - *"Current is consumed / used up in a bulb"*
  - *"Batteries supply a constant current regardless of load"*
  - *"Higher resistance means more current"*
  - *"Series and parallel bulbs have equal brightness"*
  - *"Adding parallel resistors increases equivalent resistance"*
  - *"Electrons travel at the speed of light along the wire"*
  - *"Voltmeters connect in series"*
- **Reasoning Analysis**: `lib/llm.ts` analyzes the student's written words rather than just the option index.
- **100% Deterministic Fallback**: Operates completely offline without an API key using keyword and distractor mapping.
- **Counter-Example Repair**: Displays a named "Bug Card" and serves a targeted counter-intuitive challenge question. Solving it extinguishes the red flare and restores star brightness!

### 5. ⏳ Spaced Repetition (SM-2) & Celestial Forgetting Curve
- Concept stability scheduling via SuperMemo SM-2 ($I(n) = I(n-1) \times EF$).
- **Celestial Dimming**: Star luminosity dims over elapsed days following Ebbinghaus retention:
  $$L(t) = P(L) \cdot (0.4 + 0.6 \cdot e^{-t / S})$$
- Stars due for review pulse softly with an amber aura.

### 6. 👩‍🏫 Teacher Dashboard (`/teacher`)
- **30 Simulated Students Cohort**: Realistic heterogeneous distribution across 4 personas: High Achievers, Math Stumblers, Misconception-Prone, and Foundational Strugglers (clearly marked as *Simulated Data*).
- **Matrix Heatmap**: 30 Students $\times$ 29 Concepts with color-coded mastery and active bug flags.
- **Ranked Class Gaps**: Identifies class-wide bottlenecks.
- **Top Shared Misconceptions**: Displays class distribution (e.g., *"17 of 30 students believe current is used up"*).
- **AI Suggested Lesson Plan for Tomorrow**: Proposes a 45-minute lesson with a hands-on inquiry counter-experiment ("The Twin Ammeter Test") and discussion prompts.
- **Student Drill-Down**: Click any concept or misconception to see the exact student roster needing intervention.

### 7. ⚡ 3-Minute Demo Mode
- A 1-click button in the navigation bar that fast-forwards the learner state with varied star luminosities, active red flares, and review queues for quick hackathon demonstrations.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom celestial shaders & glassmorphism
- **Storage**: Typed persistent local store (`data/store.json`) with atomic writes
- **Visuals**: Dynamic responsive SVG Constellation Canvas with radial celestial halos
- **LLM Layer**: `lib/llm.ts` supporting Gemini API / OpenAI API with strict JSON schema validation, retry loop, and **100% offline deterministic fallbacks** in `/data`.
- **Testing**: Node.js native test runner via `tsx` (12 unit tests).

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*(Note: If no API key is provided, ConstellationEd seamlessly uses its built-in deterministic question bank and misconception engine).*

### 3. Run Unit Tests
```bash
npm test
```
*Validates 12 tests across BKT updates, convergence, prerequisite propagation, SM-2 intervals, and forgetting curve retention.*

### 4. Start the Application
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🗺️ Routes & Demo Walkthrough

| Route | Description |
| :--- | :--- |
| `/student` | Student Sky: Constellation canvas, live exam score HUD, active bug cards, star inspector, and review queue. |
| `/teacher` | Teacher Hub: 30-student cohort heatmap, ranked class gaps, top shared misconceptions, and AI lesson plan. |
| `POST /api/demo/fast-forward` | Fast-forwards state for a 3-minute hackathon demo. |

### 3-Minute Demo Flow for Judges:
1. Open `/student` and click **"Demo Mode (3 min)"** in the top navigation.
2. Observe the Constellation Sky: stars brighten according to mastery, two stars erupt with **red solar flares** (misconceptions on *Electric Current* and *Ohm's Law*), and amber-pulsing stars indicate *review due*.
3. Scroll down to the **"Detected Mental Model Bugs"** card for *"Current is Consumed in a Bulb"*.
4. Click **"Fix Bug via Counter-Example"**, answer the Twin Ammeter challenge, and watch the red flare extinguish as confetti celebrates your cognitive repair!
5. Click **"Start Today's Session"** to experience the adaptive diagnostic test with mandatory one-line reasoning.
6. Switch to **"Teacher Hub"** in the top navbar: explore the 30-student heatmap, click a weak concept to inspect struggling students, and review the AI-suggested lesson plan for tomorrow's class.
