import { parseCsvLine } from './parseCsvLine'; import assert from 'node:assert/strict';
assert.deepEqual(parseCsvLine('a,"b,c",d'), ["a", "b,c", "d"]);