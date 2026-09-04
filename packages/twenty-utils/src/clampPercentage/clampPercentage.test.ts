import { clampPercentage } from './clampPercentage'; import assert from 'node:assert/strict';
assert.equal(clampPercentage(120), 100); assert.equal(clampPercentage(-10), 0);