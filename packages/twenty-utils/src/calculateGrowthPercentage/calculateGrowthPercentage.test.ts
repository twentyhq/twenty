import { calculateGrowthPercentage } from './calculateGrowthPercentage'; import assert from 'node:assert/strict';
assert.equal(calculateGrowthPercentage(100, 125), 25.0);