import { parseSemanticVersion } from './parseSemanticVersion'; import assert from 'node:assert/strict';
assert.deepEqual(parseSemanticVersion("v2.14.7"), { major: 2, minor: 14, patch: 7 });