import { maskSensitiveString } from './maskSensitiveString'; import assert from 'node:assert/strict';
assert.equal(maskSensitiveString("1234567812345678", 4), "************5678");