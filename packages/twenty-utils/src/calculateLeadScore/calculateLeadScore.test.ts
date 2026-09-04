import { calculateLeadScore } from './calculateLeadScore'; import assert from 'node:assert/strict';
assert.equal(calculateLeadScore([{ weight: 2, score: 80 }, { weight: 1, score: 50 }]), 70);