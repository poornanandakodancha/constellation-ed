import { NextResponse } from "next/server";
import { getDatabase, saveDatabase, getConceptMasteries } from "@/lib/db";
import { calculatePredictedExamScore } from "@/lib/exam-score";
import conceptsData from "@/data/concepts.json";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const studentId = body.studentId || "student_demo";

    // Ensure masteries exist
    getConceptMasteries(studentId);
    const db = getDatabase();

    // Reset student previous history
    db.attempts = db.attempts.filter((a) => a.student_id !== studentId);
    db.misconception_logs = db.misconception_logs.filter((m) => m.student_id !== studentId);
    db.diagnostic_sessions = db.diagnostic_sessions.filter((s) => s.student_id !== studentId);

    // Fast-forward realistic concept masteries
    const highConcepts = ["electric_charge", "conductors_insulators", "electric_circuit", "ammeter_measurement"];
    const medConcepts = ["electric_potential", "v_i_graph", "factors_affecting_resistance", "joules_law_of_heating", "electric_fuse_safety"];
    const lowWithMisc = ["electric_current", "ohms_law", "series_vs_parallel_comparison"];
    const reviewDueConcepts = ["potential_difference", "voltmeter_measurement", "electrical_resistance"];

    const now = Date.now();

    for (const concept of conceptsData) {
      let p = 0.25;
      let interval = 1;
      let lastSeen = new Date(now - 86400000).toISOString();
      let nextReview = new Date(now + 86400000 * 2).toISOString();
      let attempts = 2;
      let correct = 1;

      if (highConcepts.includes(concept.id)) {
        p = 0.88 + Math.random() * 0.08;
        interval = 7;
        attempts = 6;
        correct = 5;
        nextReview = new Date(now + 86400000 * 6).toISOString();
      } else if (medConcepts.includes(concept.id)) {
        p = 0.62 + Math.random() * 0.12;
        interval = 3;
        attempts = 4;
        correct = 3;
        nextReview = new Date(now + 86400000 * 3).toISOString();
      } else if (lowWithMisc.includes(concept.id)) {
        p = 0.28 + Math.random() * 0.08;
        interval = 1;
        attempts = 5;
        correct = 1;
        nextReview = new Date(now - 86400000).toISOString(); // Due now!
      } else if (reviewDueConcepts.includes(concept.id)) {
        p = 0.72;
        interval = 4;
        attempts = 4;
        correct = 3;
        lastSeen = new Date(now - 8 * 86400000).toISOString();
        nextReview = new Date(now - 4 * 86400000).toISOString();
      }

      const masteryIdx = db.masteries.findIndex(
        (m) => m.student_id === studentId && m.concept_id === concept.id
      );

      const updatedObj = {
        student_id: studentId,
        concept_id: concept.id,
        p_mastery: Number(p.toFixed(2)),
        attempts,
        correct_count: correct,
        last_seen: lastSeen,
        avg_response_time_ms: 7500,
        interval_days: interval,
        ease_factor: 2.5,
        repetitions: p > 0.7 ? 3 : 0,
        next_review_at: nextReview
      };

      if (masteryIdx !== -1) {
        db.masteries[masteryIdx] = updatedObj;
      } else {
        db.masteries.push(updatedObj);
      }
    }

    // Seed 2 active misconceptions for live demo
    db.misconception_logs.push({
      id: `misc_${studentId}_curr_used_up`,
      student_id: studentId,
      misconception_id: "curr_used_up",
      concept_id: "electric_current",
      reasoning_evidence: "The second ammeter reads less because the bulb used up some current for lighting.",
      confidence: 0.94,
      timestamp: new Date().toISOString(),
      resolved: false
    });

    db.misconception_logs.push({
      id: `misc_${studentId}_battery_const_curr`,
      student_id: studentId,
      misconception_id: "battery_const_curr",
      concept_id: "ohms_law",
      reasoning_evidence: "A 12V battery always outputs 2A regardless of whatever resistor is wired in.",
      confidence: 0.89,
      timestamp: new Date().toISOString(),
      resolved: false
    });

    saveDatabase(db);

    const freshMasteries = db.masteries.filter((m) => m.student_id === studentId);
    const score = calculatePredictedExamScore(freshMasteries);

    return NextResponse.json({
      success: true,
      message: "Demo Mode activated: Realistic fast-forward state initialized with active misconceptions, varied star luminosities, and spaced repetition queue.",
      predicted_exam_score: score
    });
  } catch (error) {
    console.error("Demo fast-forward error:", error);
    return NextResponse.json({ success: false, error: "Failed to activate demo mode" }, { status: 500 });
  }
}
