import { maskIpAddress } from './maskIpAddress'; import assert from 'node:assert/strict';
assert.equal(maskIpAddress("192.168.1.55"), "192.168.1.0");