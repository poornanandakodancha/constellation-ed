import { NextResponse } from "next/server";
import { getConceptMasteries, getOrCreateStudent, getDatabase, saveDatabase } from "@/lib/db";
import { selectNextDiagnosticQuestion } from "@/lib/diagnostic";
import { calculatePredictedExamScore } from "@/lib/exam-score";
import { DiagnosticSession } from "@/types";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const studentId = body.studentId || "student_demo";

    // Ensure student exists
    getOrCreateStudent(studentId, "Alex Sharma");
    const masteries = getConceptMasteries(studentId);

    // Initialize or reset diagnostic session
    const db = getDatabase();
    db.diagnostic_sessions = db.diagnostic_sessions.filter((s) => s.student_id !== studentId);

    const newSession: DiagnosticSession = {
      id: `diag_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      student_id: studentId,
      current_question_index: 1,
      max_questions: 12,
      completed: false,
      questions_answered: [],
      started_at: new Date().toISOString(),
      completed_at: null
    };

    db.diagnostic_sessions.push(newSession);
    saveDatabase(db);

    // Select the first adaptive question
    const selection = selectNextDiagnosticQuestion(masteries, []);
    const examScore = calculatePredictedExamScore(masteries);

    return NextResponse.json({
      success: true,
      session: newSession,
      question: selection.question,
      selection_reason: selection.reason,
      concept_id: selection.conceptId,
      predicted_exam_score: examScore
    });
  } catch (error) {
    console.error("Diagnostic start error:", error);
    return NextResponse.json({ success: false, error: "Failed to initialize diagnostic session" }, { status: 500 });
  }
}
