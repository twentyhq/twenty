import { generateDeterministicColor } from './generateDeterministicColor'; import assert from 'node:assert/strict';
assert.equal(generateDeterministicColor("user-123").startsWith("hsl("), true);