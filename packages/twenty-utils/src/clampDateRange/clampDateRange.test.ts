import { clampDateRange } from './clampDateRange'; import assert from 'node:assert/strict';
const now = new Date("2026-05-01"), min = new Date("2026-01-01"), max = new Date("2026-04-01");
assert.equal(clampDateRange(now, min, max).toISOString(), max.toISOString());