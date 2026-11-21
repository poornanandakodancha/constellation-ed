import fs from "fs";
import path from "path";
import os from "os";
import { AppDatabase, ConceptMastery, MisconceptionLog, QuestionAttempt, Student } from "@/types";
import conceptsData from "@/data/concepts.json";

// In-memory global singleton for serverless container persistence across requests
const globalForDb = globalThis as unknown as {
  __constellationDb?: AppDatabase;
};

// Determine appropriate storage file path
// In Vercel serverless functions, process.cwd() is read-only at runtime.
// os.tmpdir() (/tmp) is the designated writable directory in AWS Lambda / Vercel.
function getWritableDbPath(): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), "constellation_store.json");
  }
  return path.join(process.cwd(), "data", "store.json");
}

function getBundledSeedDbPath(): string {
  return path.join(process.cwd(), "data", "store.json");
}

const DEFAULT_PRIOR_MASTERY = 0.20; // Initial prior probability for BKT
const DEFAULT_EASE_FACTOR = 2.5;

function createInitialStudent(id: string = "student_demo", name: string = "Alex Sharma"): Student {
  return {
    id,
    name,
    avatar: "cosmic_student_1",
    is_simulated: false,
    created_at: new Date().toISOString()
  };
}

function createInitialMasteries(studentId: string): ConceptMastery[] {
  return conceptsData.map((concept) => ({
    student_id: studentId,
    concept_id: concept.id,
    p_mastery: DEFAULT_PRIOR_MASTERY,
    attempts: 0,
    correct_count: 0,
    last_seen: null,
    avg_response_time_ms: 0,
    interval_days: 1,
    ease_factor: DEFAULT_EASE_FACTOR,
    repetitions: 0,
    next_review_at: null
  }));
}

function initializeEmptyDatabase(): AppDatabase {
  const defaultStudent = createInitialStudent();
  return {
    students: [defaultStudent],
    masteries: createInitialMasteries(defaultStudent.id),
    attempts: [],
    misconception_logs: [],
    diagnostic_sessions: []
  };
}

export function getDatabase(): AppDatabase {
  // 1. Fast path: return in-memory cached instance if already initialized in this process
  if (globalForDb.__constellationDb) {
    return globalForDb.__constellationDb;
  }

  const writablePath = getWritableDbPath();
  const bundledSeedPath = getBundledSeedDbPath();

  // 2. Try loading from writable runtime path (e.g. /tmp on Vercel or data/store.json locally)
  try {
    if (fs.existsSync(writablePath)) {
      const raw = fs.readFileSync(writablePath, "utf-8");
      const parsed: AppDatabase = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.students) && parsed.students.length > 0) {
        globalForDb.__constellationDb = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Could not read from writable path, falling back to bundled seed:", err);
  }

  // 3. Fallback: load bundled seed database from project root (read-only safe)
  try {
    if (fs.existsSync(bundledSeedPath)) {
      const raw = fs.readFileSync(bundledSeedPath, "utf-8");
      const parsed: AppDatabase = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.students) && parsed.students.length > 0) {
        globalForDb.__constellationDb = parsed;
        // Attempt to copy seed to writable path for persistence across warm invocations
        trySaveToDisk(writablePath, parsed);
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Could not read bundled seed store.json:", err);
  }

  // 4. Fallback: fresh initialized database
  const initialDb = initializeEmptyDatabase();
  globalForDb.__constellationDb = initialDb;
  trySaveToDisk(writablePath, initialDb);
  return initialDb;
}

function trySaveToDisk(filePath: string, db: AppDatabase): void {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(db, null, 2), "utf-8");
  } catch (error) {
    // Gracefully catch read-only filesystem or ephemeral quota errors in serverless
    // The in-memory global singleton ensures the application continues working without throwing a 500 error
    console.warn(`[Storage] Running in-memory mode; filesystem write skipped:`, error);
  }
}

export function saveDatabase(db: AppDatabase): void {
  // Always update in-memory singleton
  globalForDb.__constellationDb = db;

  const writablePath = getWritableDbPath();
  trySaveToDisk(writablePath, db);
}

export function getStudent(id: string): Student | undefined {
  const db = getDatabase();
  return db.students.find((s) => s.id === id);
}

export function getOrCreateStudent(id: string, name: string = "Student"): Student {
  const db = getDatabase();
  let student = db.students.find((s) => s.id === id);
  if (!student) {
    student = {
      id,
      name,
      avatar: "cosmic_student_1",
      is_simulated: false,
      created_at: new Date().toISOString()
    };
    db.students.push(student);
    const masteries = createInitialMasteries(id);
    db.masteries.push(...masteries);
    saveDatabase(db);
  }
  return student;
}

export function getConceptMasteries(studentId: string): ConceptMastery[] {
  const db = getDatabase();
  const masteries = db.masteries.filter((m) => m.student_id === studentId);
  if (masteries.length === 0) {
    const newMasteries = createInitialMasteries(studentId);
    db.masteries.push(...newMasteries);
    saveDatabase(db);
    return newMasteries;
  }
  // Ensure every concept in conceptsData is present
  const existingConceptIds = new Set(masteries.map((m) => m.concept_id));
  let modified = false;
  for (const concept of conceptsData) {
    if (!existingConceptIds.has(concept.id)) {
      const added: ConceptMastery = {
        student_id: studentId,
        concept_id: concept.id,
        p_mastery: DEFAULT_PRIOR_MASTERY,
        attempts: 0,
        correct_count: 0,
        last_seen: null,
        avg_response_time_ms: 0,
        interval_days: 1,
        ease_factor: DEFAULT_EASE_FACTOR,
        repetitions: 0,
        next_review_at: null
      };
      db.masteries.push(added);
      masteries.push(added);
      modified = true;
    }
  }
  if (modified) {
    saveDatabase(db);
  }
  return masteries;
}

export function getConceptMastery(studentId: string, conceptId: string): ConceptMastery {
  const masteries = getConceptMasteries(studentId);
  const found = masteries.find((m) => m.concept_id === conceptId);
  if (found) return found;

  const db = getDatabase();
  const created: ConceptMastery = {
    student_id: studentId,
    concept_id: conceptId,
    p_mastery: DEFAULT_PRIOR_MASTERY,
    attempts: 0,
    correct_count: 0,
    last_seen: null,
    avg_response_time_ms: 0,
    interval_days: 1,
    ease_factor: DEFAULT_EASE_FACTOR,
    repetitions: 0,
    next_review_at: null
  };
  db.masteries.push(created);
  saveDatabase(db);
  return created;
}

export function updateConceptMastery(
  studentId: string,
  conceptId: string,
  updates: Partial<ConceptMastery>
): ConceptMastery {
  const db = getDatabase();
  const index = db.masteries.findIndex(
    (m) => m.student_id === studentId && m.concept_id === conceptId
  );

  if (index === -1) {
    const fresh: ConceptMastery = {
      student_id: studentId,
      concept_id: conceptId,
      p_mastery: DEFAULT_PRIOR_MASTERY,
      attempts: 0,
      correct_count: 0,
      last_seen: null,
      avg_response_time_ms: 0,
      interval_days: 1,
      ease_factor: DEFAULT_EASE_FACTOR,
      repetitions: 0,
      next_review_at: null,
      ...updates
    };
    db.masteries.push(fresh);
    saveDatabase(db);
    return fresh;
  }

  const updated: ConceptMastery = {
    ...db.masteries[index],
    ...updates
  };
  db.masteries[index] = updated;
  saveDatabase(db);
  return updated;
}

export function recordAttempt(
  attemptData: Omit<QuestionAttempt, "id" | "timestamp">
): QuestionAttempt {
  const db = getDatabase();
  const attempt: QuestionAttempt = {
    ...attemptData,
    id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString()
  };
  db.attempts.push(attempt);
  saveDatabase(db);
  return attempt;
}

export function logMisconception(
  logData: Omit<MisconceptionLog, "id" | "timestamp">
): MisconceptionLog {
  const db = getDatabase();
  // Check if already active and unresolved
  const existing = db.misconception_logs.find(
    (m) =>
      m.student_id === logData.student_id &&
      m.misconception_id === logData.misconception_id &&
      !m.resolved
  );
  if (existing) {
    existing.confidence = Math.max(existing.confidence, logData.confidence);
    existing.reasoning_evidence = logData.reasoning_evidence;
    saveDatabase(db);
    return existing;
  }

  const newLog: MisconceptionLog = {
    ...logData,
    id: `misc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString()
  };
  db.misconception_logs.push(newLog);
  saveDatabase(db);
  return newLog;
}

export function resolveMisconception(studentId: string, misconceptionId: string): void {
  const db = getDatabase();
  for (const log of db.misconception_logs) {
    if (log.student_id === studentId && log.misconception_id === misconceptionId) {
      log.resolved = true;
    }
  }
  saveDatabase(db);
}

export function getActiveMisconceptions(studentId: string): MisconceptionLog[] {
  const db = getDatabase();
  return db.misconception_logs.filter((m) => m.student_id === studentId && !m.resolved);
}

export function resetStudentData(studentId: string): void {
  const db = getDatabase();
  db.masteries = db.masteries.filter((m) => m.student_id !== studentId);
  db.attempts = db.attempts.filter((a) => a.student_id !== studentId);
  db.misconception_logs = db.misconception_logs.filter((m) => m.student_id !== studentId);
  db.diagnostic_sessions = db.diagnostic_sessions.filter((d) => d.student_id !== studentId);

  const freshMasteries = createInitialMasteries(studentId);
  db.masteries.push(...freshMasteries);
  saveDatabase(db);
}
