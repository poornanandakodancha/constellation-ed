import conceptsData from "@/data/concepts.json";

export interface BKTParameters {
  p_init: number;  // Initial prior probability P(L0)
  p_trans: number; // Transition / learning rate P(T)
  p_slip: number;  // Slip probability P(S) (knows, but makes a slip)
  p_guess: number; // Guess probability P(G) (does not know, but guesses right)
}

// Calibrated defaults for 4-option multiple choice questions
export const DEFAULT_BKT_PARAMS: BKTParameters = {
  p_init: 0.20,
  p_trans: 0.15,
  p_slip: 0.10,
  p_guess: 0.25 // 1 out of 4 options
};

/**
 * Calculates updated mastery probability given an observation (correct/incorrect)
 * using standard 4-parameter Bayesian Knowledge Tracing.
 *
 * @param currentMastery Prior mastery probability P(Lt) in [0, 1]
 * @param isCorrect Whether the student answered correctly (true = 1, false = 0)
 * @param params BKT parameters (p_init, p_trans, p_slip, p_guess)
 * @returns Updated posterior probability P(Lt+1) in [0.01, 0.99]
 */
export function calculateBKTUpdate(
  currentMastery: number,
  isCorrect: boolean,
  params: BKTParameters = DEFAULT_BKT_PARAMS
): { posterior: number; nextMastery: number; delta: number } {
  // Clamp current mastery to valid range
  const pL = Math.min(0.99, Math.max(0.01, currentMastery));
  const { p_slip, p_guess, p_trans } = params;

  let pPosterior: number;

  if (isCorrect) {
    // P(L | correct) = (P(L) * (1 - S)) / (P(L) * (1 - S) + (1 - P(L)) * G)
    const numerator = pL * (1 - p_slip);
    const denominator = numerator + (1 - pL) * p_guess;
    pPosterior = denominator > 0 ? numerator / denominator : pL;
  } else {
    // P(L | incorrect) = (P(L) * S) / (P(L) * S + (1 - P(L)) * (1 - G))
    const numerator = pL * p_slip;
    const denominator = numerator + (1 - pL) * (1 - p_guess);
    pPosterior = denominator > 0 ? numerator / denominator : pL;
  }

  // Learning step: P(Lt+1) = P(L | obs) + (1 - P(L | obs)) * T
  const nextMasteryRaw = pPosterior + (1 - pPosterior) * p_trans;
  const nextMastery = Math.min(0.99, Math.max(0.01, nextMasteryRaw));
  const delta = nextMastery - pL;

  return {
    posterior: pPosterior,
    nextMastery,
    delta
  };
}

/**
 * Propagates an update to upstream prerequisite concepts in the DAG.
 * If the student failed an advanced concept (e.g. Ohm's Law), confidence in
 * prerequisites (Current, Potential Difference) is dampened proportionally.
 * If the student mastered an advanced concept, prerequisites receive a mild reinforcement.
 */
export function propagatePrerequisiteUpdates(
  conceptId: string,
  targetDelta: number,
  currentMasteries: Map<string, number>
): Map<string, number> {
  const updatedMap = new Map<string, number>(currentMasteries);
  const conceptMap = new Map(conceptsData.map((c) => [c.id, c]));

  // Dampening factors
  const DAMPENING_PENALTY = 0.35; // How much a failure impacts prerequisites
  const REINFORCE_BONUS = 0.15;   // How much a success reinforces prerequisites

  const queue: { id: string; depth: number }[] = [];
  const visited = new Set<string>();

  const targetConcept = conceptMap.get(conceptId);
  if (!targetConcept || !targetConcept.prerequisites) {
    return updatedMap;
  }

  // Initialize queue with direct prerequisites
  for (const prereqId of targetConcept.prerequisites) {
    queue.push({ id: prereqId, depth: 1 });
    visited.add(prereqId);
  }

  while (queue.length > 0) {
    const item = queue.shift()!;
    const prereqConcept = conceptMap.get(item.id);
    if (!prereqConcept) continue;

    const currentP = updatedMap.get(item.id) ?? DEFAULT_BKT_PARAMS.p_init;
    const attenuation = Math.pow(0.7, item.depth - 1); // Exponential attenuation by depth

    let prereqDelta: number;
    if (targetDelta < 0) {
      // Negative delta: dampen prerequisite mastery
      prereqDelta = targetDelta * DAMPENING_PENALTY * attenuation;
    } else {
      // Positive delta: reinforce prerequisite
      prereqDelta = targetDelta * REINFORCE_BONUS * attenuation;
    }

    const newP = Math.min(0.99, Math.max(0.01, currentP + prereqDelta));
    updatedMap.set(item.id, newP);

    // Continue traversing upstream prerequisites
    for (const upstreamId of prereqConcept.prerequisites) {
      if (!visited.has(upstreamId)) {
        visited.add(upstreamId);
        queue.push({ id: upstreamId, depth: item.depth + 1 });
      }
    }
  }

  return updatedMap;
}
