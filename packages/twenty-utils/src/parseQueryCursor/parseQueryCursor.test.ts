import { encodeCursor, decodeCursor } from './parseQueryCursor'; import assert from 'node:assert/strict';
const c = encodeCursor({ id: 10 }); assert.deepEqual(decodeCursor(c), { id: 10 });