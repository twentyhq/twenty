// selfheal-demo/add.test.mjs
//
// Tiny self-contained fixture for the Self-Heal CI demo.
// It uses Node's built-in test runner (`node --test`), so CI needs ZERO installs:
// no package.json, no yarn, no Nx — just Node 22.
//
// The function below has a deliberate bug; the test catches it. The self-healing
// agent should fix the FUNCTION (not the test) and open a draft PR.
//
// To demo the FLAKY path instead, add a second *.test.mjs file here whose result
// depends on timing or Math.random() — the agent will quarantine it rather than "fix" it.

import { test } from "node:test";
import assert from "node:assert/strict";

// ── code under test ──
export function add(a, b) {
  return a - b; // BUG: should be a + b
}

// ── test ──
test("add() returns the sum of two numbers", () => {
  assert.equal(add(2, 3), 5);
  assert.equal(add(-1, 1), 0);
});
