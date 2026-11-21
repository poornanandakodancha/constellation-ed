import misconceptionsData from "@/data/misconceptions.json";
import questionsData from "@/data/questions.json";
import { Misconception, MisconceptionDetectionResult, Question } from "@/types";

export interface LLMConfig {
  apiKey?: string;
  provider?: "gemini" | "openai" | "mock";
  model?: string;
}

function getLLMConfig(): LLMConfig {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    return {
      apiKey: geminiKey,
      provider: "gemini",
      model: "gemini-1.5-flash"
    };
  }
  if (openaiKey) {
    return {
      apiKey: openaiKey,
      provider: "openai",
      model: "gpt-4o-mini"
    };
  }
  return {
    provider: "mock"
  };
}

/**
 * Raw call to Gemini API with JSON mode
 */
async function callGemini(apiKey: string, model: string, prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    }),
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty candidate response from Gemini");
  return text;
}

/**
 * Raw call to OpenAI API with JSON mode
 */
async function callOpenAI(apiKey: string, model: string, prompt: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2
    }),
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty choice response from OpenAI");
  return text;
}

/**
 * Robust JSON caller with retry once, falling back gracefully
 */
async function callLLMWithRetry(prompt: string): Promise<string | null> {
  const config = getLLMConfig();
  if (config.provider === "mock" || !config.apiKey) {
    return null; // Triggers deterministic fallback
  }

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      if (config.provider === "gemini") {
        return await callGemini(config.apiKey, config.model || "gemini-1.5-flash", prompt);
      } else if (config.provider === "openai") {
        return await callOpenAI(config.apiKey, config.model || "gpt-4o-mini", prompt);
      }
    } catch (err) {
      console.warn(`LLM attempt ${attempt} failed:`, err);
      if (attempt === 2) return null;
    }
  }
  return null;
}

// ==========================================
// 1. MISCONCEPTION DETECTION WITH FALLBACK
// ==========================================

export async function detectMisconception(params: {
  question: string;
  chosenOption: string;
  correctOption: string;
  studentReasoning: string;
  conceptId: string;
}): Promise<MisconceptionDetectionResult> {
  const { question, chosenOption, correctOption, studentReasoning, conceptId } = params;

  // Curate candidate misconceptions for this concept or related concepts
  const candidateMisconceptions = (misconceptionsData as Misconception[]).map((m) => ({
    id: m.id,
    concept_id: m.concept_id,
    name: m.name,
    typical_belief: m.typical_belief,
    description: m.description,
    keywords: m.distractor_trigger_keywords || []
  }));

  const prompt = `You are an expert cognitive science Physics tutor diagnosing student misconceptions in Class 10 Physics (Electricity).
Analyze the student's WRONG answer and their TYPED REASONING.

Question: "${question}"
Student chose: "${chosenOption}"
Correct answer was: "${correctOption}"
Student's typed reason: "${studentReasoning}"
Concept ID: "${conceptId}"

Known Misconception Catalog:
${JSON.stringify(candidateMisconceptions, null, 2)}

INSTRUCTIONS:
1. Detect whether the student's typed reasoning reflects a specific known misconception from the catalog.
2. Even if they chose an option, examine their typed words: does their mental model hold a flawed premise?
3. Output strictly valid JSON matching this schema:
{
  "misconception_id": "<id from catalog or null if generic slip>",
  "confidence": <number between 0.0 and 1.0>,
  "evidence_quote_from_reasoning": "<verbatim phrase or clause from student's reason demonstrating the bug>",
  "explanation": "<2-sentence explanation of why their reasoning reflects this mental model bug>"
}`;

  try {
    const rawResult = await callLLMWithRetry(prompt);
    if (rawResult) {
      const parsed = JSON.parse(rawResult);
      if (typeof parsed.confidence === "number" && (parsed.misconception_id === null || typeof parsed.misconception_id === "string")) {
        return {
          misconception_id: parsed.misconception_id,
          confidence: Number(parsed.confidence.toFixed(2)),
          evidence_quote_from_reasoning: parsed.evidence_quote_from_reasoning || studentReasoning,
          explanation: parsed.explanation || "Identified misconception in student's conceptual reasoning."
        };
      }
    }
  } catch (err) {
    console.warn("LLM misconception parsing failed, using deterministic fallback:", err);
  }

  // ----------------------------------------------------
  // DETERMINISTIC FALLBACK: Keyword & Distractor Matching
  // ----------------------------------------------------
  return deterministicMisconceptionFallback(chosenOption, studentReasoning, conceptId);
}

function deterministicMisconceptionFallback(
  chosenOption: string,
  reasoning: string,
  conceptId: string
): MisconceptionDetectionResult {
  const lowerReason = (reasoning + " " + chosenOption).toLowerCase();

  for (const misc of misconceptionsData as Misconception[]) {
    // Check keyword triggers
    if (misc.distractor_trigger_keywords) {
      for (const kw of misc.distractor_trigger_keywords) {
        if (lowerReason.includes(kw.toLowerCase())) {
          return {
            misconception_id: misc.id,
            confidence: 0.90,
            evidence_quote_from_reasoning: reasoning.slice(0, 80),
            explanation: `Student holds the belief: "${misc.typical_belief}". Detected via reasoning patterns.`
          };
        }
      }
    }

    // Match by concept if direct keywords partially align
    if (misc.concept_id === conceptId) {
      const beliefWords = misc.typical_belief.toLowerCase().split(" ").filter((w) => w.length > 4);
      let matchCount = 0;
      for (const word of beliefWords) {
        if (lowerReason.includes(word)) matchCount++;
      }
      if (matchCount >= 2) {
        return {
          misconception_id: misc.id,
          confidence: 0.80,
          evidence_quote_from_reasoning: reasoning.slice(0, 80),
          explanation: `Student reasoning aligns with ${misc.name}: "${misc.typical_belief}".`
        };
      }
    }
  }

  // Default fallback if no specific misconception catalog triggered
  return {
    misconception_id: null,
    confidence: 0.35,
    evidence_quote_from_reasoning: reasoning.slice(0, 60),
    explanation: "Incorrect answer appears to be an execution slip or calculation error rather than a cataloged mental model bug."
  };
}

// ==========================================
// 2. QUESTION GENERATION WITH FALLBACK
// ==========================================

export async function generateTargetedQuestion(params: {
  conceptId: string;
  conceptName: string;
  targetDifficulty: number; // 1 to 5
  studentMastery: number;
  streak: number;
}): Promise<Question> {
  const { conceptId, conceptName, targetDifficulty, studentMastery, streak } = params;

  // Calibrate difficulty so expected success probability ~ 70%
  // If student has a positive streak, calibrate difficulty slightly higher (+0.5)
  let calibratedDifficulty = targetDifficulty;
  if (streak >= 3) calibratedDifficulty = Math.min(5, calibratedDifficulty + 1);
  else if (streak <= -2) calibratedDifficulty = Math.max(1, calibratedDifficulty - 1);

  const prompt = `You are an expert exam question creator for Class 10 Physics (CBSE/NCERT, Chapter: Electricity).
Generate a targeted multiple-choice question for concept: "${conceptName}" (ID: ${conceptId}).

Target Difficulty: ${calibratedDifficulty} out of 5 (where 1 is direct recall, 3 is standard numerical, 5 is multi-step synthesis).
Current Student Mastery: ${(studentMastery * 100).toFixed(0)}%.
Target Goal: Student should have approximately a 70% chance of answering correctly if they grasp core principles.

INSTRUCTIONS:
1. Provide exactly 4 plausible options. Only one must be scientifically correct.
2. The 3 distractors should represent common student pitfalls or misconceptions.
3. Return ONLY valid JSON matching this exact structure:
{
  "id": "gen_${conceptId}_${Date.now()}",
  "concept_id": "${conceptId}",
  "difficulty": ${calibratedDifficulty},
  "question": "<question text>",
  "options": [
    "<option A>",
    "<option B>",
    "<option C>",
    "<option D>"
  ],
  "correct_index": <0, 1, 2, or 3>,
  "explanation": "<step-by-step physical explanation of the correct solution>",
  "distractor_misconceptions": {
    "0": null,
    "1": null,
    "2": null,
    "3": null
  }
}`;

  try {
    const rawResult = await callLLMWithRetry(prompt);
    if (rawResult) {
      const parsed: Question = JSON.parse(rawResult);
      if (
        parsed.question &&
        Array.isArray(parsed.options) &&
        parsed.options.length === 4 &&
        typeof parsed.correct_index === "number" &&
        parsed.explanation
      ) {
        return {
          ...parsed,
          id: `gen_${conceptId}_${Date.now()}`,
          concept_id: conceptId,
          difficulty: calibratedDifficulty
        };
      }
    }
  } catch (err) {
    console.warn("LLM question generation failed, using deterministic question bank fallback:", err);
  }

  // ----------------------------------------------------
  // DETERMINISTIC FALLBACK: Calibrated Question Bank
  // ----------------------------------------------------
  return deterministicQuestionFallback(conceptId, calibratedDifficulty);
}

function deterministicQuestionFallback(conceptId: string, targetDifficulty: number): Question {
  const bank = questionsData as unknown as Question[];
  const matching = bank.filter((q) => q.concept_id === conceptId);

  if (matching.length > 0) {
    // Pick closest difficulty match
    matching.sort(
      (a, b) => Math.abs(a.difficulty - targetDifficulty) - Math.abs(b.difficulty - targetDifficulty)
    );
    return matching[0];
  }

  // Fallback to any question in bank
  return bank[Math.floor(Math.random() * bank.length)];
}

// ==========================================
// 3. AI LESSON PLAN GENERATOR (FOR TEACHER)
// ==========================================

export async function generateSuggestedLessonPlan(params: {
  weakestConcepts: { id: string; name: string; avgMastery: number }[];
  topMisconceptions: { id: string; name: string; count: number; typicalBelief: string }[];
}): Promise<{
  title: string;
  duration_minutes: number;
  objectives: string[];
  counter_experiment: {
    title: string;
    materials: string[];
    steps: string[];
    expected_aha_moment: string;
  };
  remediation_activities: string[];
  key_questions_to_ask_class: string[];
}> {
  const { weakestConcepts, topMisconceptions } = params;

  const prompt = `You are a master physics teacher and pedagogical coach for Class 10 Electricity.
Given the following real-time class diagnostics:
Weakest Concepts: ${JSON.stringify(weakestConcepts)}
Top Shared Misconceptions: ${JSON.stringify(topMisconceptions)}

Generate a structured 45-minute lesson plan for tomorrow's class that directly addresses these misconceptions and conceptual gaps through an interactive, counter-intuitive inquiry demonstration.

Return strictly valid JSON:
{
  "title": "<compelling lesson title>",
  "duration_minutes": 45,
  "objectives": ["<objective 1>", "<objective 2>", "<objective 3>"],
  "counter_experiment": {
    "title": "<name of interactive live demo>",
    "materials": ["<item 1>", "<item 2>", "<item 3>"],
    "steps": ["<step 1>", "<step 2>", "<step 3>"],
    "expected_aha_moment": "<what students realize when their intuition fails>"
  },
  "remediation_activities": ["<activity 1>", "<activity 2>"],
  "key_questions_to_ask_class": ["<question 1>", "<question 2>", "<question 3>"]
}`;

  try {
    const rawResult = await callLLMWithRetry(prompt);
    if (rawResult) {
      const parsed = JSON.parse(rawResult);
      if (parsed.title && parsed.counter_experiment && parsed.remediation_activities) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("LLM lesson plan failed, using deterministic fallback:", err);
  }

  // Deterministic fallback lesson plan
  const primaryConcept = weakestConcepts[0]?.name || "Ohm's Law & Circuit Analysis";
  const primaryMisc = topMisconceptions[0]?.name || "Current is Consumed in a Bulb";

  return {
    title: `Targeted Remediation: Deconstructing '${primaryMisc}' & Mastering ${primaryConcept}`,
    duration_minutes: 45,
    objectives: [
      `Demonstrate electric charge conservation across series and parallel loads.`,
      `Distinguish between electric potential difference (energy per charge) and electric current (charge flow rate).`,
      `Apply Ohm's law to predict circuit responses to changing branch resistance.`
    ],
    counter_experiment: {
      title: "The Twin Ammeter Discrepancy Test",
      materials: [
        "12 V DC Power Supply / Battery",
        "Two high-accuracy digital multimeters / ammeters",
        "60 W incandescent light bulb with clear filament"
      ],
      steps: [
        "Wire Ammeter 1 directly between the battery (+) terminal and the light bulb inlet.",
        "Wire Ammeter 2 directly between the bulb outlet and the battery (-) return terminal.",
        "Ask the class to vote: 'Will Ammeter 2 read less current than Ammeter 1?'",
        "Switch on the bulb and have students read both digital displays simultaneously."
      ],
      expected_aha_moment: "Both ammeters read exactly the same value (0.50 A)! Students see that electric charge is never consumed; only electrical potential energy is converted into radiant photons and thermal heat."
    },
    remediation_activities: [
      "Small-group toll-booth analogy challenge: drawing parallel vs series highway bottlenecks.",
      "Peer-instruction quiz: Predicting ammeter readings when a third resistor is connected in parallel."
    ],
    key_questions_to_ask_class: [
      "If a bulb doesn't consume electric current, what does your electric utility bill actually charge you for?",
      "Why does a voltmeter read almost 0 V across a plain connecting wire, but 6 V across the tiny filament?",
      "If you cut a resistance wire in half, why does each piece carry twice as much current under the same voltage?"
    ]
  };
}
