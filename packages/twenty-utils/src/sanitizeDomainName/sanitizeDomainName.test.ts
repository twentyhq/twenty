import { sanitizeDomainName } from './sanitizeDomainName'; import assert from 'node:assert/strict';
assert.equal(sanitizeDomainName("https://www.twenty.com/blog"), "twenty.com");