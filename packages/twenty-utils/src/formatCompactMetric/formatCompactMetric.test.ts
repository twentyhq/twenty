import { formatCompactMetric } from './formatCompactMetric'; import assert from 'node:assert/strict';
assert.equal(formatCompactMetric(52400), "$52.4k");