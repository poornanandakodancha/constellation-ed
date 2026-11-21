import { ConceptMastery } from "@/types";
import conceptsData from "@/data/concepts.json";

export interface ExamScorePrediction {
  predicted_score: number; // 0 to 100
  confidence_percentage: number; // 0 to 100
  letter_grade: string;
  total_concepts: number;
  mastered_concepts: number; // mastery >= 0.8
  learning_concepts: number; // 0.4 <= mastery < 0.8
  unseen_or_struggling: number; // mastery < 0.4
}

/**
 * Computes a weighted predicted exam score from student concept masteries.
 * Difficulty weighting reflects CBSE Class 10 Board Exam blueprint.
 */
export function calculatePredictedExamScore(
  masteries: ConceptMastery[]
): ExamScorePrediction {
  const masteryMap = new Map<string, ConceptMastery>(
    masteries.map((m) => [m.concept_id, m])
  );

  let totalWeight = 0;
  let weightedMasterySum = 0;
  let totalAttempts = 0;
  let masteredCount = 0;
  let learningCount = 0;
  let strugglingCount = 0;

  for (const concept of conceptsData) {
    const weight = concept.difficulty; // Weight from 1 to 5
    totalWeight += weight;

    const m = masteryMap.get(concept.id);
    const pMastery = m ? m.p_mastery : 0.20;
    const attempts = m ? m.attempts : 0;
    totalAttempts += attempts;

    weightedMasterySum += pMastery * weight;

    if (pMastery >= 0.80) {
      masteredCount++;
    } else if (pMastery >= 0.40) {
      learningCount++;
    } else {
      strugglingCount++;
    }
  }

  const rawPercentage = totalWeight > 0 ? (weightedMasterySum / totalWeight) * 100 : 0;
  const predictedScore = Math.round(Math.min(100, Math.max(0, rawPercentage)));

  // Confidence scales with total attempts across concepts (asymptotes to 95%)
  const confidence = Math.min(95, Math.round(20 + 75 * (1 - Math.exp(-totalAttempts / 15))));

  let letterGrade = "D";
  if (predictedScore >= 91) letterGrade = "A1 (Outstanding)";
  else if (predictedScore >= 81) letterGrade = "A2 (Excellent)";
  else if (predictedScore >= 71) letterGrade = "B1 (Very Good)";
  else if (predictedScore >= 61) letterGrade = "B2 (Good)";
  else if (predictedScore >= 51) letterGrade = "C1 (Above Average)";
  else if (predictedScore >= 41) letterGrade = "C2 (Average)";
  else if (predictedScore >= 33) letterGrade = "D (Passing)";
  else letterGrade = "E (Needs Immediate Review)";

  return {
    predicted_score: predictedScore,
    confidence_percentage: confidence,
    letter_grade: letterGrade,
    total_concepts: conceptsData.length,
    mastered_concepts: masteredCount,
    learning_concepts: learningCount,
    unseen_or_struggling: strugglingCount
  };
}
