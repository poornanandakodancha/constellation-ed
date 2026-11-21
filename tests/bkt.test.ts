import test from "node:test";
import assert from "node:assert/strict";
import { calculateBKTUpdate, propagatePrerequisiteUpdates, DEFAULT_BKT_PARAMS } from "../lib/bkt";

test("BKT - correct answer increases mastery probability", () => {
  const initialMastery = 0.30;
  const result = calculateBKTUpdate(initialMastery, true, DEFAULT_BKT_PARAMS);

  assert.ok(result.nextMastery > initialMastery, `Expected next mastery ${result.nextMastery} to be > ${initialMastery}`);
  assert.ok(result.delta > 0, `Expected delta ${result.delta} to be positive`);
  assert.ok(result.posterior > initialMastery, "Posterior should increase with correct answer");
});

test("BKT - incorrect answer decreases mastery probability", () => {
  const initialMastery = 0.70;
  const result = calculateBKTUpdate(initialMastery, false, DEFAULT_BKT_PARAMS);

  assert.ok(result.nextMastery < initialMastery, `Expected next mastery ${result.nextMastery} to be < ${initialMastery}`);
  assert.ok(result.delta < 0, `Expected delta ${result.delta} to be negative`);
});

test("BKT - consecutive correct answers converge toward high mastery", () => {
  let mastery = 0.20;
  for (let i = 0; i < 5; i++) {
    const update = calculateBKTUpdate(mastery, true);
    mastery = update.nextMastery;
  }
  assert.ok(mastery >= 0.85, `Mastery after 5 correct answers should be >= 0.85, got ${mastery}`);
});

test("BKT - boundaries are strictly clamped between 0.01 and 0.99", () => {
  const extremeHigh = calculateBKTUpdate(1.0, true);
  assert.ok(extremeHigh.nextMastery <= 0.99, "Should not exceed 0.99");

  const extremeLow = calculateBKTUpdate(0.0, false);
  assert.ok(extremeLow.nextMastery >= 0.01, "Should not go below 0.01");
});

test("BKT - prerequisite propagation dampens upstream concepts upon failure", () => {
  const initialMasteries = new Map<string, number>([
    ["ohms_law", 0.50],
    ["electric_current", 0.60],
    ["potential_difference", 0.65],
    ["electric_charge", 0.70]
  ]);

  // Failure on Ohm's law (delta = -0.25)
  const targetDelta = -0.25;
  const propagated = propagatePrerequisiteUpdates("ohms_law", targetDelta, initialMasteries);

  const currMastery = propagated.get("electric_current")!;
  const potMastery = propagated.get("potential_difference")!;

  assert.ok(currMastery < 0.60, `electric_current should decrease, got ${currMastery}`);
  assert.ok(potMastery < 0.65, `potential_difference should decrease, got ${potMastery}`);
});

test("BKT - prerequisite propagation reinforces upstream concepts upon success", () => {
  const initialMasteries = new Map<string, number>([
    ["ohms_law", 0.40],
    ["electric_current", 0.50],
    ["potential_difference", 0.50]
  ]);

  // Success on Ohm's law (delta = +0.20)
  const targetDelta = +0.20;
  const propagated = propagatePrerequisiteUpdates("ohms_law", targetDelta, initialMasteries);

  const currMastery = propagated.get("electric_current")!;
  const potMastery = propagated.get("potential_difference")!;

  assert.ok(currMastery > 0.50, `electric_current should increase, got ${currMastery}`);
  assert.ok(potMastery > 0.50, `potential_difference should increase, got ${potMastery}`);
});
