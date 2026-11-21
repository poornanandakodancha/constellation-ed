export interface Concept {
  id: string;
  name: string;
  cluster: string;
  prerequisites: string[];
  difficulty: number; // 1 to 5
  short_explanation: string;
  x_hint?: number;
  y_hint?: number;
}

export interface CounterExampleQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface Misconception {
  id: string;
  concept_id: string;
  name: string;
  description: string;
  typical_belief: string;
  why_it_feels_true: string;
  scientific_truth: string;
  counter_example_question: CounterExampleQuestion;
  distractor_trigger_keywords?: string[];
}

export interface Question {
  id: string;
  concept_id: string;
  difficulty: number; // 1 to 5
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  distractor_misconceptions?: Record<string, string | null | undefined>; // option index -> misconception_id
}

export interface Student {
  id: string;
  name: string;
  avatar?: string;
  is_simulated?: boolean;
  created_at: string;
}

export interface ConceptMastery {
  student_id: string;
  concept_id: string;
  p_mastery: number; // 0.0 to 1.0 (BKT probability of mastery)
  attempts: number;
  correct_count: number;
  last_seen: string | null;
  avg_response_time_ms: number;
  // SM-2 Spaced Repetition parameters
  interval_days: number;
  ease_factor: number; // SM-2 ease factor (>= 1.3, default 2.5)
  repetitions: number;
  next_review_at: string | null;
}

export interface QuestionAttempt {
  id: string;
  student_id: string;
  concept_id: string;
  question_id: string;
  chosen_option: number;
  is_correct: boolean;
  reasoning: string;
  response_time_ms: number;
  timestamp: string;
}

export interface MisconceptionLog {
  id: string;
  student_id: string;
  misconception_id: string;
  concept_id: string;
  reasoning_evidence: string;
  confidence: number;
  timestamp: string;
  resolved: boolean;
}

export interface DiagnosticSession {
  id: string;
  student_id: string;
  current_question_index: number;
  max_questions: number;
  completed: boolean;
  questions_answered: string[];
  started_at: string;
  completed_at: string | null;
}

export interface AppDatabase {
  students: Student[];
  masteries: ConceptMastery[];
  attempts: QuestionAttempt[];
  misconception_logs: MisconceptionLog[];
  diagnostic_sessions: DiagnosticSession[];
}

export interface MisconceptionDetectionResult {
  misconception_id: string | null;
  confidence: number;
  evidence_quote_from_reasoning: string;
  explanation: string;
}
