import { validateVatNumber } from './validateVatNumber'; import assert from 'node:assert/strict';
assert.equal(validateVatNumber("GB123456789"), true); assert.equal(validateVatNumber("123"), false);