import { truncateMiddleString } from './truncateMiddleString'; import assert from 'node:assert/strict';
assert.equal(truncateMiddleString("0x1234567890abcdef1234"), "0x1234...1234");