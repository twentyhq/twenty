import { batchArrayChunks } from './batchArrayChunks'; import assert from 'node:assert/strict';
assert.deepEqual(batchArrayChunks([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);