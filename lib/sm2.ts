export interface SM2State {
  repetitions: number;
  interval_days: number;
  ease_factor: number;
  next_review_at: string;
}

export interface SM2Input {
  quality: number; // 0 to 5
  repetitions: number;
  interval_days: number;
  ease_factor: number;
  current_date?: Date;
}

const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;

/**
 * SuperMemo SM-2 Spaced Repetition Algorithm.
 *
 * Quality ratings (q):
 * 5: Perfect recall, rapid response
 * 4: Correct answer, minor hesitation
 * 3: Correct answer with difficulty
 * 2: Incorrect, but upon seeing solution recalled
 * 1: Incorrect with active misconception
 * 0: Complete blackout
 */
export function calculateSM2(input: SM2Input): SM2State {
  const { quality, repetitions, interval_days, ease_factor } = input;
  const now = input.current_date ?? new Date();

  const q = Math.max(0, Math.min(5, Math.round(quality)));
  const currentEf = Math.max(MIN_EASE_FACTOR, ease_factor || DEFAULT_EASE_FACTOR);

  let nextRepetitions: number;
  let nextInterval: number;

  if (q >= 3) {
    // Successful recall
    if (repetitions === 0) {
      nextInterval = 1;
    } else if (repetitions === 1) {
      nextInterval = 6;
    } else {
      nextInterval = Math.max(1, Math.round(interval_days * currentEf));
    }
    nextRepetitions = repetitions + 1;
  } else {
    // Failed recall: reset repetitions
    nextRepetitions = 0;
    nextInterval = 1;
  }

  // Update Ease Factor (EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))
  const efDelta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  const nextEf = Math.max(MIN_EASE_FACTOR, currentEf + efDelta);

  const nextReviewDate = new Date(now.getTime() + nextInterval * 24 * 60 * 60 * 1000);

  return {
    repetitions: nextRepetitions,
    interval_days: nextInterval,
    ease_factor: Number(nextEf.toFixed(2)),
    next_review_at: nextReviewDate.toISOString()
  };
}

/**
 * Calculates current visual brightness (luminosity) and retention decay factor
 * based on Ebbinghaus forgetting curve.
 *
 * @param pMastery BKT mastery probability (0.0 to 1.0)
 * @param lastSeen ISO timestamp of last practice
 * @param intervalDays Scheduled SM-2 interval
 * @param now Current timestamp
 * @returns { luminosity: number (0.0 - 1.0), isDue: boolean, retention: number }
 */
export function calculateRetentionAndLuminosity(
  pMastery: number,
  lastSeen: string | null,
  intervalDays: number,
  now: Date = new Date()
): { luminosity: number; isDue: boolean; retention: number } {
  if (!lastSeen) {
    // Concept never seen yet: base luminosity on prior mastery
    return {
      luminosity: Math.max(0.15, pMastery * 0.5),
      isDue: true,
      retention: pMastery
    };
  }

  const lastSeenDate = new Date(lastSeen);
  const elapsedMs = Math.max(0, now.getTime() - lastSeenDate.getTime());
  const elapsedDays = elapsedMs / (24 * 60 * 60 * 1000);

  // Memory stability scale S proportional to interval
  const stability = Math.max(1, intervalDays * 1.2);

  // Ebbinghaus retention: R = e^(-t / S)
  const retention = Math.exp(-elapsedDays / stability);

  // Apparent luminosity dims as retention fades
  const luminosity = Math.max(0.12, Math.min(1.0, pMastery * (0.4 + 0.6 * retention)));
  const isDue = elapsedDays >= Math.max(1, intervalDays);

  return {
    luminosity: Number(luminosity.toFixed(3)),
    isDue,
    retention: Number(retention.toFixed(3))
  };
}
