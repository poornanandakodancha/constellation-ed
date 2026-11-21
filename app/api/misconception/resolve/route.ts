import { NextResponse } from "next/server";
import { getConceptMastery, updateConceptMastery, resolveMisconception, getConceptMasteries } from "@/lib/db";
import { calculateBKTUpdate } from "@/lib/bkt";
import { calculatePredictedExamScore } from "@/lib/exam-score";
import misconceptionsData from "@/data/misconceptions.json";
import { Misconception } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentId = "student_demo", misconceptionId, chosenIndex } = body;

    const misc = (misconceptionsData as Misconception[]).find((m) => m.id === misconceptionId);
    if (!misc) {
      return NextResponse.json({ success: false, error: "Misconception not found" }, { status: 404 });
    }

    const isCorrect = chosenIndex === misc.counter_example_question.correct_index;

    if (isCorrect) {
      // Resolve the mental model bug
      resolveMisconception(studentId, misconceptionId);

      // Boost concept mastery to reflect cognitive repair
      const current = getConceptMastery(studentId, misc.concept_id);
      const bkt = calculateBKTUpdate(current.p_mastery, true);
      // Give an extra boost for overcoming misconception
      const boostedMastery = Math.min(0.95, bkt.nextMastery + 0.15);

      updateConceptMastery(studentId, misc.concept_id, {
        p_mastery: boostedMastery,
        attempts: current.attempts + 1,
        correct_count: current.correct_count + 1,
        last_seen: new Date().toISOString()
      });
    }

    const updatedMasteries = getConceptMasteries(studentId);
    const updatedExamScore = calculatePredictedExamScore(updatedMasteries);

    return NextResponse.json({
      success: true,
      is_correct: isCorrect,
      explanation: misc.counter_example_question.explanation,
      misconception_resolved: isCorrect,
      predicted_exam_score: updatedExamScore
    });
  } catch (error) {
    console.error("Misconception resolution error:", error);
    return NextResponse.json({ success: false, error: "Failed to resolve misconception" }, { status: 500 });
  }
}
