import { memoizeWithExpiry } from './memoizeWithExpiry'; import assert from 'node:assert/strict';
let calls = 0; const memo = memoizeWithExpiry(() => ++calls, 1000);
assert.equal(memo(), 1); assert.equal(memo(), 1);