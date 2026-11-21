import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { seedSimulatedClassroom } from "@/lib/seed-teacher";
import { generateSuggestedLessonPlan } from "@/lib/llm";
import conceptsData from "@/data/concepts.json";
import misconceptionsData from "@/data/misconceptions.json";
import { Misconception } from "@/types";

export async function GET() {
  try {
    let db = getDatabase();
    const simulatedStudents = db.students.filter((s) => s.is_simulated);

    // Auto-seed if 30 simulated students not present
    if (simulatedStudents.length < 30) {
      seedSimulatedClassroom();
      db = getDatabase();
    }

    const students = db.students.filter((s) => s.is_simulated);
    const masteries = db.masteries;
    const misconceptionLogs = db.misconception_logs;

    // 1. Calculate per-concept class statistics & gaps
    const conceptStats = conceptsData.map((concept) => {
      const conceptMasteries = masteries.filter(
        (m) => m.concept_id === concept.id && students.some((s) => s.id === m.student_id)
      );

      const avgMastery =
        conceptMasteries.length > 0
          ? conceptMasteries.reduce((sum, m) => sum + m.p_mastery, 0) / conceptMasteries.length
          : 0;

      const strugglingStudentIds = conceptMasteries
        .filter((m) => m.p_mastery < 0.50)
        .map((m) => m.student_id);

      const strugglingStudents = students
        .filter((s) => strugglingStudentIds.includes(s.id))
        .map((s) => ({
          id: s.id,
          name: s.name,
          mastery: conceptMasteries.find((m) => m.student_id === s.id)?.p_mastery || 0
        }))
        .sort((a, b) => a.mastery - b.mastery);

      return {
        concept_id: concept.id,
        name: concept.name,
        cluster: concept.cluster,
        difficulty: concept.difficulty,
        avg_mastery: Number(avgMastery.toFixed(2)),
        struggling_count: strugglingStudents.length,
        struggling_students: strugglingStudents
      };
    });

    // Rank class gaps (weakest concepts first)
    const rankedGaps = [...conceptStats].sort((a, b) => a.avg_mastery - b.avg_mastery);

    // 2. Calculate top shared misconceptions
    const miscCounts = new Map<string, Set<string>>();
    for (const log of misconceptionLogs) {
      if (!log.resolved && students.some((s) => s.id === log.student_id)) {
        const studentSet = miscCounts.get(log.misconception_id) ?? new Set<string>();
        studentSet.add(log.student_id);
        miscCounts.set(log.misconception_id, studentSet);
      }
    }

    const topSharedMisconceptions = (misconceptionsData as Misconception[])
      .map((misc) => {
        const affectedSet = miscCounts.get(misc.id) ?? new Set<string>();
        const count = affectedSet.size;
        const affectedStudents = students
          .filter((s) => affectedSet.has(s.id))
          .map((s) => ({ id: s.id, name: s.name }));

        return {
          id: misc.id,
          concept_id: misc.concept_id,
          name: misc.name,
          description: misc.description,
          typical_belief: misc.typical_belief,
          count,
          percentage: Math.round((count / students.length) * 100),
          affected_students: affectedStudents
        };
      })
      .filter((m) => m.count > 0)
      .sort((a, b) => b.count - a.count);

    // 3. Generate or fetch AI suggested lesson plan for tomorrow
    const weakest3 = rankedGaps.slice(0, 3).map((g) => ({
      id: g.concept_id,
      name: g.name,
      avgMastery: g.avg_mastery
    }));

    const top3Misc = topSharedMisconceptions.slice(0, 3).map((m) => ({
      id: m.id,
      name: m.name,
      count: m.count,
      typicalBelief: m.typical_belief
    }));

    const suggestedLesson = await generateSuggestedLessonPlan({
      weakestConcepts: weakest3,
      topMisconceptions: top3Misc
    });

    // 4. Matrix heatmap data (students x concepts)
    const heatmap = students.map((student) => {
      const studentMasteries = masteries.filter((m) => m.student_id === student.id);
      const masteryDict: Record<string, number> = {};
      let totalMastery = 0;

      for (const sm of studentMasteries) {
        masteryDict[sm.concept_id] = sm.p_mastery;
        totalMastery += sm.p_mastery;
      }

      const activeMiscByConcept: Record<string, { id: string; name: string; evidence: string }> = {};
      misconceptionLogs
        .filter((l) => l.student_id === student.id && !l.resolved)
        .forEach((l) => {
          const miscDef = (misconceptionsData as Misconception[]).find((m) => m.id === l.misconception_id);
          activeMiscByConcept[l.concept_id] = {
            id: l.misconception_id,
            name: miscDef ? miscDef.name : l.misconception_id,
            evidence: l.reasoning_evidence
          };
        });

      const avgMastery =
        studentMasteries.length > 0 ? totalMastery / studentMasteries.length : 0;

      return {
        student_id: student.id,
        name: student.name,
        avatar: student.avatar,
        overall_mastery: Number(avgMastery.toFixed(2)),
        masteries: masteryDict,
        active_misconceptions: activeMiscByConcept
      };
    });

    return NextResponse.json({
      success: true,
      metadata: {
        total_students: students.length,
        total_concepts: conceptsData.length,
        is_simulated_cohort: true,
        cohort_tag: "Class 10-A (Simulated Data)"
      },
      ranked_gaps: rankedGaps,
      top_misconceptions: topSharedMisconceptions,
      suggested_lesson: suggestedLesson,
      heatmap
    });
  } catch (error) {
    console.error("Teacher analytics error:", error);
    return NextResponse.json({ success: false, error: "Failed to load teacher analytics" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    if (body.action === "reseed") {
      seedSimulatedClassroom();
      return NextResponse.json({ success: true, message: "Classroom successfully re-seeded with 30 simulated students." });
    }
    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Teacher action error:", error);
    return NextResponse.json({ success: false, error: "Failed to execute teacher action" }, { status: 500 });
  }
}
