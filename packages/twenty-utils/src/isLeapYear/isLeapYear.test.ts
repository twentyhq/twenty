import { isLeapYear } from './isLeapYear'; import assert from 'node:assert/strict';
assert.equal(isLeapYear(2024), true); assert.equal(isLeapYear(2026), false);