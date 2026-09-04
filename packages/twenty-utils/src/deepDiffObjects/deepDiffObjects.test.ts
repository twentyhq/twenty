import { deepDiffObjects } from './deepDiffObjects'; import assert from 'node:assert/strict';
assert.deepEqual(deepDiffObjects({ a: 1, b: 2 }, { a: 1, b: 3 }), { b: { from: 2, to: 3 } });