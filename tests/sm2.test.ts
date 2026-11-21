import test from "node:test";
import assert from "node:assert/strict";
import { calculateSM2, calculateRetentionAndLuminosity } from "../lib/sm2";

test("SM-2 - initial quality recall produces 1-day interval", () => {
  const result = calculateSM2({
    quality: 4,
    repetitions: 0,
    interval_days: 1,
    ease_factor: 2.5
  });

  assert.equal(result.repetitions, 1);
  assert.equal(result.interval_days, 1);
  assert.ok(result.next_review_at);
});

test("SM-2 - second successful repetition sets 6-day interval", () => {
  const result = calculateSM2({
    quality: 5,
    repetitions: 1,
    interval_days: 1,
    ease_factor: 2.5
  });

  assert.equal(result.repetitions, 2);
  assert.equal(result.interval_days, 6);
});

test("SM-2 - third successful repetition multiplies interval by ease factor", () => {
  const result = calculateSM2({
    quality: 4,
    repetitions: 2,
    interval_days: 6,
    ease_factor: 2.5
  });

  assert.equal(result.repetitions, 3);
  assert.equal(result.interval_days, 15); // Math.round(6 * 2.5) = 15
});

test("SM-2 - failed recall resets repetitions to 0 and interval to 1", () => {
  const result = calculateSM2({
    quality: 1, // Severe misconception or wrong answer
    repetitions: 4,
    interval_days: 30,
    ease_factor: 2.3
  });

  assert.equal(result.repetitions, 0);
  assert.equal(result.interval_days, 1);
  assert.ok(result.ease_factor < 2.3, "Ease factor should drop on failure");
  assert.ok(result.ease_factor >= 1.3, "Ease factor should respect minimum floor of 1.3");
});

test("SM-2 - ease factor floor is strictly preserved at 1.30", () => {
  let ef = 1.35;
  for (let i = 0; i < 5; i++) {
    const res = calculateSM2({
      quality: 0,
      repetitions: 0,
      interval_days: 1,
      ease_factor: ef
    });
    ef = res.ease_factor;
  }
  assert.equal(ef, 1.3);
});

test("Forgetting Curve - luminosity decays over elapsed time", () => {
  const baseMastery = 0.90;
  const now = new Date();
  const fresh = calculateRetentionAndLuminosity(baseMastery, now.toISOString(), 6, now);

  const tenDaysLater = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
  const decayed = calculateRetentionAndLuminosity(baseMastery, now.toISOString(), 6, tenDaysLater);

  assert.ok(decayed.luminosity < fresh.luminosity, "Luminosity should decay over time");
  assert.equal(decayed.isDue, true, "10 days elapsed on 6-day interval should be due");
  assert.ok(decayed.retention < fresh.retention, "Retention should decay over time");
});
