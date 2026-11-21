import { NextResponse } from "next/server";
import {
  getConceptMasteries,
  getConceptMastery,
  updateConceptMastery,
  recordAttempt,
  logMisconception,
  getDatabase,
  saveDatabase
} from "@/lib/db";
import { calculateBKTUpdate, propagatePrerequisiteUpdates } from "@/lib/bkt";
import { calculateSM2 } from "@/lib/sm2";
import { checkDiagnosticStoppingCriterion, selectNextDiagnosticQuestion } from "@/lib/diagnostic";
import { calculatePredictedExamScore } from "@/lib/exam-score";
import { detectMisconception } from "@/lib/llm";

export const dynamic = "force-dynamic";
import questionsData from "@/data/questions.json";
import misconceptionsData from "@/data/misconceptions.json";
import { Misconception, Question } from "@/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      studentId = "student_demo",
      questionId,
      chosenOption,
      reasoning = "",
      responseTimeMs = 5000
    } = body;

    if (!questionId || chosenOption === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: questionId, chosenOption" },
        { status: 400 }
      );
    }

    if (!reasoning.trim()) {
      return NextResponse.json(
        { success: false, error: "One-line reasoning is required: 'Why did you pick this?'" },
        { status: 400 }
      );
    }

    // Locate question
    const question = (questionsData as unknown as Question[]).find((q) => q.id === questionId);
    if (!question) {
      return NextResponse.json({ success: false, error: "Question not found" }, { status: 404 });
    }

    const isCorrect = chosenOption === question.correct_index;
    const chosenOptionText = question.options[chosenOption] || `Option ${chosenOption}`;
    const correctOptionText = question.options[question.correct_index];

    // 1. Current concept mastery
    const currentMastery = getConceptMastery(studentId, question.concept_id);

    // 2. Bayesian Knowledge Tracing update
    const bktResult = calculateBKTUpdate(currentMastery.p_mastery, isCorrect);

    // 3. Spaced Repetition (SM-2) update
    // Quality: 5 for fast correct, 4 for normal correct, 1 for misconception error, 2 for slip error
    let qualityRating = 2;
    if (isCorrect) {
      qualityRating = responseTimeMs < 15000 ? 5 : 4;
    } else {
      qualityRating = 1;
    }

    const sm2Result = calculateSM2({
      quality: qualityRating,
      repetitions: currentMastery.repetitions,
      interval_days: currentMastery.interval_days,
      ease_factor: currentMastery.ease_factor
    });

    // 4. Update concept mastery in DB
    const newAttempts = currentMastery.attempts + 1;
    const newCorrect = currentMastery.correct_count + (isCorrect ? 1 : 0);
    const newAvgTime =
      (currentMastery.avg_response_time_ms * currentMastery.attempts + responseTimeMs) / newAttempts;

    updateConceptMastery(studentId, question.concept_id, {
      p_mastery: bktResult.nextMastery,
      attempts: newAttempts,
      correct_count: newCorrect,
      last_seen: new Date().toISOString(),
      avg_response_time_ms: Math.round(newAvgTime),
      repetitions: sm2Result.repetitions,
      interval_days: sm2Result.interval_days,
      ease_factor: sm2Result.ease_factor,
      next_review_at: sm2Result.next_review_at
    });

    // 5. Prerequisite Propagation
    const allMasteries = getConceptMasteries(studentId);
    const masteryMap = new Map<string, number>(allMasteries.map((m) => [m.concept_id, m.p_mastery]));
    // Set updated mastery for target
    masteryMap.set(question.concept_id, bktResult.nextMastery);

    const propagatedMap = propagatePrerequisiteUpdates(question.concept_id, bktResult.delta, masteryMap);

    // Persist propagated updates
    propagatedMap.forEach((pValue, cId) => {
      if (cId !== question.concept_id) {
        updateConceptMastery(studentId, cId, { p_mastery: pValue });
      }
    });

    // 6. Record question attempt in DB
    recordAttempt({
      student_id: studentId,
      concept_id: question.concept_id,
      question_id: question.id,
      chosen_option: chosenOption,
      is_correct: isCorrect,
      reasoning: reasoning.trim(),
      response_time_ms: responseTimeMs
    });

    // 7. Misconception Detection (if incorrect)
    let detectedMisconception = null;
    let counterExample = null;

    if (!isCorrect) {
      const detectionResult = await detectMisconception({
        question: question.question,
        chosenOption: chosenOptionText,
        correctOption: correctOptionText,
        studentReasoning: reasoning.trim(),
        conceptId: question.concept_id
      });

      if (detectionResult.misconception_id) {
        const fullMisc = (misconceptionsData as Misconception[]).find(
          (m) => m.id === detectionResult.misconception_id
        );

        if (fullMisc) {
          logMisconception({
            student_id: studentId,
            misconception_id: fullMisc.id,
            concept_id: question.concept_id,
            reasoning_evidence: detectionResult.evidence_quote_from_reasoning,
            confidence: detectionResult.confidence,
            resolved: false
          });

          detectedMisconception = {
            id: fullMisc.id,
            name: fullMisc.name,
            description: fullMisc.description,
            typical_belief: fullMisc.typical_belief,
            why_it_feels_true: fullMisc.why_it_feels_true,
            scientific_truth: fullMisc.scientific_truth,
            evidence_quote: detectionResult.evidence_quote_from_reasoning,
            explanation: detectionResult.explanation,
            confidence: detectionResult.confidence
          };

          counterExample = fullMisc.counter_example_question;
        }
      }
    }

    // 8. Session Management & Early Stopping
    const db = getDatabase();
    let session = db.diagnostic_sessions.find(
      (s) => s.student_id === studentId && !s.completed
    );

    if (!session) {
      session = {
        id: `diag_${Date.now()}`,
        student_id: studentId,
        current_question_index: 1,
        max_questions: 12,
        completed: false,
        questions_answered: [question.id],
        started_at: new Date().toISOString(),
        completed_at: null
      };
      db.diagnostic_sessions.push(session);
    } else {
      if (!session.questions_answered.includes(question.id)) {
        session.questions_answered.push(question.id);
      }
      session.current_question_index = session.questions_answered.length;
    }

    const updatedMasteries = getConceptMasteries(studentId);
    const stoppingEvaluation = checkDiagnosticStoppingCriterion(
      session.questions_answered.length,
      updatedMasteries
    );

    let nextQuestion = null;
    let nextSelectionReason = null;

    if (stoppingEvaluation.shouldStop) {
      session.completed = true;
      session.completed_at = new Date().toISOString();
    } else {
      const nextSelection = selectNextDiagnosticQuestion(
        updatedMasteries,
        session.questions_answered
      );
      nextQuestion = nextSelection.question;
      nextSelectionReason = nextSelection.reason;
      if (!nextQuestion) {
        session.completed = true;
        session.completed_at = new Date().toISOString();
      }
    }

    saveDatabase(db);

    const updatedExamScore = calculatePredictedExamScore(updatedMasteries);

    return NextResponse.json({
      success: true,
      is_correct: isCorrect,
      correct_index: question.correct_index,
      explanation: question.explanation,
      bkt: {
        previous_mastery: currentMastery.p_mastery,
        new_mastery: bktResult.nextMastery,
        delta: bktResult.delta
      },
      detected_misconception: detectedMisconception,
      counter_example: counterExample,
      predicted_exam_score: updatedExamScore,
      is_completed: session.completed,
      stopping_reason: stoppingEvaluation.reason,
      session_progress: {
        answered_count: session.questions_answered.length,
        max_questions: session.max_questions,
        current_index: session.current_question_index
      },
      next_question: nextQuestion,
      next_selection_reason: nextSelectionReason
    });
  } catch (error) {
    console.error("Diagnostic answer error:", error);
    return NextResponse.json({ success: false, error: "Failed to evaluate answer" }, { status: 500 });
  }
}
