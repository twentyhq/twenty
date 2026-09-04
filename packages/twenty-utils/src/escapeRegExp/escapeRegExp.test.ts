import { escapeRegExp } from './escapeRegExp'; import assert from 'node:assert/strict';
assert.equal(escapeRegExp("hello.world*?"), "hello\\.world\\*\\?");