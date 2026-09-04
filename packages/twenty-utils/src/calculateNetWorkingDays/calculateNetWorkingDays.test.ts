import { calculateNetWorkingDays } from './calculateNetWorkingDays'; import assert from 'node:assert/strict';
assert.equal(calculateNetWorkingDays(new Date("2026-06-01"), new Date("2026-06-05")), 5);