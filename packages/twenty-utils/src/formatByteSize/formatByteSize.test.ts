import { formatByteSize } from './formatByteSize'; import assert from 'node:assert/strict';
assert.equal(formatByteSize(1048576), "1.0 MiB");