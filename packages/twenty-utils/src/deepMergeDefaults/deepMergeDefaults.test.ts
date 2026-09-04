import { deepMergeDefaults } from './deepMergeDefaults'; import assert from 'node:assert/strict';
assert.deepEqual(deepMergeDefaults({ a: 1 }, { a: 2, b: 3 }), { a: 1, b: 3 });