import { partitionArray } from './partitionArray'; import assert from 'node:assert/strict';
assert.deepEqual(partitionArray([1, 2, 3, 4], x => x % 2 === 0), [[2, 4], [1, 3]]);