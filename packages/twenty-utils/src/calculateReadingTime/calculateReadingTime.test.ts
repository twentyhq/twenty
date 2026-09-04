import { calculateReadingTime } from './calculateReadingTime'; import assert from 'node:assert/strict';
assert.equal(calculateReadingTime("word ".repeat(450)), 3);