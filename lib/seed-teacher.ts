import { ConceptMastery, MisconceptionLog, Student } from "@/types";
import conceptsData from "@/data/concepts.json";
import misconceptionsData from "@/data/misconceptions.json";
import { getDatabase, saveDatabase } from "@/lib/db";

const STUDENT_NAMES = [
  "Aarav Patel", "Diya Sharma", "Rohan Mehta", "Ananya Iyer", "Vivaan Gupta",
  "Ishaan Verma", "Myra Sen", "Kabir Joshi", "Sneha Rao", "Aditya Kulkarni",
  "Tanvi Nair", "Reyansh Reddy", "Pari Das", "Siddharth Bose", "Zara Khan",
  "Arjun Saxena", "Meera Pillai", "Devansh Mishra", "Riya Chauhan", "Dhruv Malhotra",
  "Tara Bhattacharya", "Atharv Deshmukh", "Navya Roy", "Pranav Agarwal", "Saanvi Pandey",
  "Shaurya Kapoor", "Avani Menon", "Yash Singhal", "Kavya Nambiar", "Ayaan Mukherjee"
];

// Helper mapping for misconception details
const MISC_MAP = new Map(misconceptionsData.map((m) => [m.id, m]));

export function seedSimulatedClassroom(): void {
  const db = getDatabase();

  // Keep any real student like student_demo, remove previous simulated students
  db.students = db.students.filter((s) => !s.is_simulated);
  const realStudentIds = new Set(db.students.map((s) => s.id));

  db.masteries = db.masteries.filter((m) => realStudentIds.has(m.student_id));
  db.misconception_logs = db.misconception_logs.filter((l) => realStudentIds.has(l.student_id));

  const newSimulatedStudents: Student[] = [];
  const newSimulatedMasteries: ConceptMastery[] = [];
  const newSimulatedMisconceptions: MisconceptionLog[] = [];

  STUDENT_NAMES.forEach((name, index) => {
    const studentId = `sim_student_${index + 1}`;
    const student: Student = {
      id: studentId,
      name,
      avatar: `cosmic_avatar_${(index % 8) + 1}`,
      is_simulated: true,
      created_at: new Date(Date.now() - (30 - index) * 86400000).toISOString()
    };
    newSimulatedStudents.push(student);

    // 4 Distinct Cohort Archetypes:
    // 0..6 (7 students): Strong / High Achievers (80-96% avg mastery)
    // 7..17 (11 students): Average / Typical Learners (56-76% avg mastery)
    // 18..24 (7 students): Conceptually Confused / Misconception-Prone (40-58% avg mastery)
    // 25..29 (5 students): Foundational Strugglers (24-42% avg mastery)
    const persona =
      index < 7 ? "strong" : index < 18 ? "average" : index < 25 ? "misconception_prone" : "struggler";

    // Track active misconceptions for this student
    const studentMisconceptionIds: string[] = [];

    if (persona === "strong") {
      // Very rare subtle misconception (only student 4 has bulb ratings slip)
      if (index === 4) studentMisconceptionIds.push("power_equals_energy");
    } else if (persona === "average") {
      // 1 targeted misconception per average student distributed across clusters
      if (index % 4 === 0) studentMisconceptionIds.push("curr_used_up");
      else if (index % 4 === 1) studentMisconceptionIds.push("battery_const_curr");
      else if (index % 4 === 2) studentMisconceptionIds.push("parallel_higher_res");
      else studentMisconceptionIds.push("higher_res_more_curr");
    } else if (persona === "misconception_prone") {
      // 2 to 3 misconceptions per student across the 4 clusters
      if (index === 18) {
        studentMisconceptionIds.push("curr_used_up", "battery_const_curr"); // Cluster 1: Current & Battery
      } else if (index === 19) {
        studentMisconceptionIds.push("higher_res_more_curr", "thick_wire_more_res"); // Cluster 2: Resistance & Dimensions
      } else if (index === 20) {
        studentMisconceptionIds.push("parallel_higher_res", "series_parallel_same_bright"); // Cluster 3: Combinations & Brightness
      } else if (index === 21) {
        studentMisconceptionIds.push("voltmeter_in_series", "ground_wire_carries_load"); // Cluster 4: Instrumentation & Safety
      } else if (index === 22) {
        studentMisconceptionIds.push("curr_used_up", "series_parallel_same_bright"); // Cross-cluster 1 & 3
      } else if (index === 23) {
        studentMisconceptionIds.push("battery_const_curr", "higher_res_more_curr"); // Cross-cluster 1 & 2
      } else {
        studentMisconceptionIds.push("parallel_higher_res", "switch_injects_electricity"); // Cross-cluster 3 & 4
      }
    } else {
      // Struggler: holds foundational misconceptions plus low general grasp
      studentMisconceptionIds.push("curr_used_up");
      if (index % 2 === 0) studentMisconceptionIds.push("voltmeter_in_series");
      else studentMisconceptionIds.push("switch_injects_electricity");
    }

    // Map misconceptions to their concepts for quick lookup
    const studentMiscConceptMap = new Map<string, string>();
    studentMisconceptionIds.forEach((mId) => {
      const def = MISC_MAP.get(mId);
      if (def) {
        studentMiscConceptMap.set(def.concept_id, mId);
      }
    });

    // Populate concept masteries
    conceptsData.forEach((concept) => {
      let p = 0.50;
      const isMathFormula = [
        "series_equivalent_resistance",
        "parallel_equivalent_resistance",
        "joules_law_of_heating",
        "electric_energy_kwh",
        "electric_power_formulas",
        "bulb_power_ratings"
      ].includes(concept.id);

      const isFoundational = [
        "electric_charge",
        "conductors_insulators",
        "electric_circuit",
        "potential_difference"
      ].includes(concept.id);

      const hasMisconceptionOnThisConcept = studentMiscConceptMap.has(concept.id);

      if (hasMisconceptionOnThisConcept) {
        // Misconception severely caps mastery on this concept (0.18 to 0.35)
        p = 0.18 + Math.random() * 0.17;
      } else if (persona === "strong") {
        p = 0.82 + Math.random() * 0.16; // 0.82 - 0.98
      } else if (persona === "average") {
        if (isFoundational) {
          p = 0.70 + Math.random() * 0.22; // 0.70 - 0.92
        } else if (isMathFormula) {
          p = 0.48 + Math.random() * 0.28; // 0.48 - 0.76
        } else {
          p = 0.58 + Math.random() * 0.24; // 0.58 - 0.82
        }
      } else if (persona === "misconception_prone") {
        if (isFoundational) {
          p = 0.60 + Math.random() * 0.20; // 0.60 - 0.80
        } else {
          p = 0.36 + Math.random() * 0.26; // 0.36 - 0.62
        }
      } else {
        // Struggler
        if (isFoundational) {
          p = 0.35 + Math.random() * 0.22; // 0.35 - 0.57
        } else {
          p = 0.16 + Math.random() * 0.24; // 0.16 - 0.40
        }
      }

      const attempts = Math.floor(3 + Math.random() * 11);
      const correct = Math.max(0, Math.floor(attempts * p));
      const interval = p > 0.75 ? Math.floor(4 + Math.random() * 10) : 1;

      newSimulatedMasteries.push({
        student_id: studentId,
        concept_id: concept.id,
        p_mastery: Number(p.toFixed(2)),
        attempts,
        correct_count: correct,
        last_seen: new Date(Date.now() - Math.floor(Math.random() * 7) * 86400000).toISOString(),
        avg_response_time_ms: Math.floor(persona === "strong" ? 5000 + Math.random() * 4000 : 8000 + Math.random() * 12000),
        interval_days: interval,
        ease_factor: Number((2.0 + Math.random() * 0.6).toFixed(2)),
        repetitions: p > 0.75 ? Math.floor(2 + Math.random() * 4) : 0,
        next_review_at: new Date(Date.now() + (interval - 2) * 86400000).toISOString()
      });
    });

    // Seed the active misconception logs
    studentMisconceptionIds.forEach((mId) => {
      const def = MISC_MAP.get(mId);
      if (def) {
        newSimulatedMisconceptions.push({
          id: `misc_${studentId}_${mId}`,
          student_id: studentId,
          misconception_id: mId,
          concept_id: def.concept_id,
          reasoning_evidence: `Student reasoning exhibited: "${def.typical_belief}"`,
          confidence: Number((0.85 + Math.random() * 0.12).toFixed(2)),
          timestamp: new Date().toISOString(),
          resolved: false
        });
      }
    });
  });

  db.students.push(...newSimulatedStudents);
  db.masteries.push(...newSimulatedMasteries);
  db.misconception_logs.push(...newSimulatedMisconceptions);

  saveDatabase(db);
}
