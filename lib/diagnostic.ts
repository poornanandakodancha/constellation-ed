import { ConceptMastery, Question } from "@/types";
import conceptsData from "@/data/concepts.json";
import questionsData from "@/data/questions.json";

const MIN_DIAGNOSTIC_QUESTIONS = 8;
const MAX_DIAGNOSTIC_QUESTIONS = 12;
const CONFIDENCE_ENTROPY_THRESHOLD = 0.45; // Below this, early stopping triggers

/**
 * Calculates Shannon entropy H(p) = -p*log2(p) - (1-p)*log2(1-p) for mastery probability.
 * Maximized at p = 0.5 (maximum uncertainty = 1.0).
 */
export function calculateConceptUncertainty(pMastery: number): number {
  const p = Math.min(0.999, Math.max(0.001, pMastery));
  return -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
}

/**
 * Selects the next most informative question for the diagnostic test.
 * Ranks concepts by:
 * 1. Highest uncertainty (entropy closest to 0.50).
 * 2. Prerequisite availability (prerequisites tested first or known).
 * 3. Never repeating an already answered question in this session.
 */
export function selectNextDiagnosticQuestion(
  masteries: ConceptMastery[],
  answeredQuestionIds: string[]
): { question: Question | null; reason: string; conceptId: string | null } {
  const answeredSet = new Set(answeredQuestionIds);
  const masteryMap = new Map<string, ConceptMastery>(
    masteries.map((m) => [m.concept_id, m])
  );

  // Group questions by concept
  const questionsByConcept = new Map<string, Question[]>();
  for (const q of (questionsData as unknown as Question[])) {
    if (!answeredSet.has(q.id)) {
      const list = questionsByConcept.get(q.concept_id) ?? [];
      list.push(q);
      questionsByConcept.set(q.concept_id, list);
    }
  }

  // Score candidate concepts
  interface Candidate {
    conceptId: string;
    uncertainty: number;
    prereqReadiness: number;
    score: number;
    availableQuestions: Question[];
  }

  const candidates: Candidate[] = [];

  for (const concept of conceptsData) {
    const available = questionsByConcept.get(concept.id) ?? [];
    if (available.length === 0) continue; // No questions remaining for this concept

    const m = masteryMap.get(concept.id);
    const p = m ? m.p_mastery : 0.20;
    const uncertainty = calculateConceptUncertainty(p);

    // Prerequisite readiness: check if direct prerequisites have been attempted
    let prereqReadiness = 1.0;
    if (concept.prerequisites && concept.prerequisites.length > 0) {
      let satisfiedPrereqs = 0;
      for (const prereqId of concept.prerequisites) {
        const pm = masteryMap.get(prereqId);
        // If prereq was attempted or has decent mastery
        if (pm && (pm.attempts > 0 || pm.p_mastery >= 0.40)) {
          satisfiedPrereqs++;
        }
      }
      prereqReadiness = 0.4 + 0.6 * (satisfiedPrereqs / concept.prerequisites.length);
    }

    // Boost concepts with 0 attempts during diagnostic to survey breadth
    const attemptCount = m ? m.attempts : 0;
    const noveltyBoost = attemptCount === 0 ? 1.3 : 1.0;

    const combinedScore = uncertainty * prereqReadiness * noveltyBoost;

    candidates.push({
      conceptId: concept.id,
      uncertainty,
      prereqReadiness,
      score: combinedScore,
      availableQuestions: available
    });
  }

  if (candidates.length === 0) {
    // Fallback: pick any unused question
    const anyUnused = (questionsData as unknown as Question[]).find((q) => !answeredSet.has(q.id));
    return {
      question: anyUnused || null,
      reason: "Fallback question selection",
      conceptId: anyUnused ? anyUnused.concept_id : null
    };
  }

  // Sort descending by score
  candidates.sort((a, b) => b.score - a.score);
  const bestCandidate = candidates[0];

  // Pick question matching student's current estimated mastery difficulty
  const m = masteryMap.get(bestCandidate.conceptId);
  const p = m ? m.p_mastery : 0.20;
  // If low mastery, pick lower difficulty (1-2), if higher mastery pick (3-4)
  const targetDifficulty = p < 0.4 ? 2 : p < 0.7 ? 3 : 4;

  const sortedQuestions = [...bestCandidate.availableQuestions].sort(
    (a, b) => Math.abs(a.difficulty - targetDifficulty) - Math.abs(b.difficulty - targetDifficulty)
  );

  return {
    question: sortedQuestions[0],
    reason: `Selected concept '${bestCandidate.conceptId}' with uncertainty ${(bestCandidate.uncertainty).toFixed(2)}`,
    conceptId: bestCandidate.conceptId
  };
}

/**
 * Checks if the diagnostic session should stop early based on confidence convergence.
 */
export function checkDiagnosticStoppingCriterion(
  questionsAnsweredCount: number,
  masteries: ConceptMastery[]
): { shouldStop: boolean; reason: string } {
  if (questionsAnsweredCount < MIN_DIAGNOSTIC_QUESTIONS) {
    return {
      shouldStop: false,
      reason: `Diagnostic in progress (${questionsAnsweredCount}/${MIN_DIAGNOSTIC_QUESTIONS} minimum required)`
    };
  }

  if (questionsAnsweredCount >= MAX_DIAGNOSTIC_QUESTIONS) {
    return {
      shouldStop: true,
      reason: `Maximum question limit reached (${MAX_DIAGNOSTIC_QUESTIONS} questions)`
    };
  }

  // Check uncertainty across attempted concepts
  const attempted = masteries.filter((m) => m.attempts > 0);
  if (attempted.length >= 6) {
    const avgUncertainty =
      attempted.reduce((sum, m) => sum + calculateConceptUncertainty(m.p_mastery), 0) /
      attempted.length;

    if (avgUncertainty <= CONFIDENCE_ENTROPY_THRESHOLD) {
      return {
        shouldStop: true,
        reason: `Confidence convergence reached (average entropy ${avgUncertainty.toFixed(2)} <= ${CONFIDENCE_ENTROPY_THRESHOLD})`
      };
    }
  }

  return {
    shouldStop: false,
    reason: `Continuing adaptive diagnostic (attempt count: ${questionsAnsweredCount})`
  };
}
