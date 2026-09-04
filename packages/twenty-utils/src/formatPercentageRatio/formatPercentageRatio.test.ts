import { formatPercentageRatio } from './formatPercentageRatio'; import assert from 'node:assert/strict';
assert.equal(formatPercentageRatio(0.1425, 1, true), "+14.3%");