import { calculateChurnProbability } from './calculateChurnProbability'; import assert from 'node:assert/strict';
assert.equal(calculateChurnProbability(45, 2, 8) > 0, true);