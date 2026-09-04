import { generateRandomColorPalette } from './generateRandomColorPalette'; import assert from 'node:assert/strict';
assert.equal(generateRandomColorPalette(3).length, 3);