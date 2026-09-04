import { truncateWords } from './truncateWords'; import assert from 'node:assert/strict';
assert.equal(truncateWords("one two three four", 2), "one two...");