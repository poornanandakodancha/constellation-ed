import { NextResponse } from "next/server";
import { getConceptMasteries, getActiveMisconceptions, getOrCreateStudent } from "@/lib/db";
import { calculateRetentionAndLuminosity } from "@/lib/sm2";
import { calculatePredictedExamScore } from "@/lib/exam-score";
import conceptsData from "@/data/concepts.json";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId") || "student_demo";

    const student = getOrCreateStudent(studentId, "Alex Sharma");
    const masteries = getConceptMasteries(studentId);
    const activeMisconceptions = getActiveMisconceptions(studentId);
    const examScore = calculatePredictedExamScore(masteries);

    const now = new Date();

    // Compute luminosity and due status per concept
    const conceptStatuses = conceptsData.map((concept) => {
      const m = masteries.find((item) => item.concept_id === concept.id);
      const pMastery = m ? m.p_mastery : 0.20;
      const lastSeen = m ? m.last_seen : null;
      const intervalDays = m ? m.interval_days : 1;

      const retention = calculateRetentionAndLuminosity(pMastery, lastSeen, intervalDays, now);
      const hasActiveMisconception = activeMisconceptions.some(
        (misc) => misc.concept_id === concept.id
      );

      return {
        concept_id: concept.id,
        name: concept.name,
        cluster: concept.cluster,
        prerequisites: concept.prerequisites,
        difficulty: concept.difficulty,
        short_explanation: concept.short_explanation,
        x_hint: concept.x_hint,
        y_hint: concept.y_hint,
        p_mastery: pMastery,
        attempts: m ? m.attempts : 0,
        luminosity: retention.luminosity,
        is_due: retention.isDue,
        retention: retention.retention,
        has_misconception: hasActiveMisconception,
        ease_factor: m ? m.ease_factor : 2.5,
        interval_days: intervalDays,
        next_review_at: m ? m.next_review_at : null
      };
    });

    // Build "Today's Review" queue: Due concepts + weakest concepts
    const dueList = conceptStatuses.filter((c) => c.is_due);
    const dueIds = new Set(dueList.map((c) => c.concept_id));

    // Sort non-due by mastery ascending (weakest first)
    const weakList = conceptStatuses
      .filter((c) => !dueIds.has(c.concept_id))
      .sort((a, b) => a.p_mastery - b.p_mastery);

    // Mix queue: up to 3 due + up to 2 weak
    const todayQueue = [...dueList.slice(0, 3), ...weakList.slice(0, 2)];

    return NextResponse.json({
      success: true,
      student,
      predicted_exam_score: examScore,
      active_misconceptions: activeMisconceptions,
      today_queue: todayQueue,
      concepts: conceptStatuses
    });
  } catch (error) {
    console.error("Session queue error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch session queue" }, { status: 500 });
  }
}
