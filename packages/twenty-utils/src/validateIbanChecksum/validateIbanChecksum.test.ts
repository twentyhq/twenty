import { validateIbanChecksum } from './validateIbanChecksum'; import assert from 'node:assert/strict';
assert.equal(validateIbanChecksum("invalid"), false);