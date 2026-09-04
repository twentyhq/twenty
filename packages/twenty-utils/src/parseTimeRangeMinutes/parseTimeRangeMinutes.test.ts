import { parseTimeRangeMinutes } from './parseTimeRangeMinutes'; import assert from 'node:assert/strict';
assert.deepEqual(parseTimeRangeMinutes("09:00-17:30"), { start: 540, end: 1050 });