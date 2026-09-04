import { calculateWeightedMovingAverage } from './calculateWeightedMovingAverage'; import assert from 'node:assert/strict';
assert.equal(calculateWeightedMovingAverage([10, 20], [1, 3]), 17.5);