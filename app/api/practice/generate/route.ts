import { NextResponse } from "next/server";
import { getConceptMasteries, getDatabase } from "@/lib/db";
import { generateTargetedQuestion } from "@/lib/llm";
import conceptsData from "@/data/concepts.json";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const studentId = body.studentId || "student_demo";
    let targetConceptId = body.conceptId;

    const masteries = getConceptMasteries(studentId);
    const db = getDatabase();

    // If conceptId not provided, pick the weakest concept
    if (!targetConceptId) {
      const sortedByMastery = [...masteries].sort((a, b) => a.p_mastery - b.p_mastery);
      targetConceptId = sortedByMastery[0]?.concept_id || "ohms_law";
    }

    const concept = conceptsData.find((c) => c.id === targetConceptId);
    if (!concept) {
      return NextResponse.json({ success: false, error: "Concept not found" }, { status: 404 });
    }

    const currentMastery = masteries.find((m) => m.concept_id === targetConceptId)?.p_mastery ?? 0.20;

    // Calculate recent streak on this concept
    const conceptAttempts = db.attempts
      .filter((a) => a.student_id === studentId && a.concept_id === targetConceptId)
      .slice(-5);

    let streak = 0;
    for (let i = conceptAttempts.length - 1; i >= 0; i--) {
      if (conceptAttempts[i].is_correct) {
        if (streak >= 0) streak++;
        else break;
      } else {
        if (streak <= 0) streak--;
        else break;
      }
    }

    // Target difficulty so expected chance of being correct is ~70%
    let baseDifficulty = 2;
    if (currentMastery < 0.35) baseDifficulty = 1;
    else if (currentMastery < 0.60) baseDifficulty = 2;
    else if (currentMastery < 0.80) baseDifficulty = 3;
    else baseDifficulty = 4;

    const question = await generateTargetedQuestion({
      conceptId: concept.id,
      conceptName: concept.name,
      targetDifficulty: baseDifficulty,
      studentMastery: currentMastery,
      streak
    });

    return NextResponse.json({
      success: true,
      concept: {
        id: concept.id,
        name: concept.name,
        cluster: concept.cluster,
        current_mastery: currentMastery
      },
      calibration: {
        base_difficulty: baseDifficulty,
        streak,
        target_success_rate: "70%"
      },
      question
    });
  } catch (error) {
    console.error("Question generation error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate targeted question" }, { status: 500 });
  }
}
