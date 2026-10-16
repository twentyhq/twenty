import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'node:util';

if (globalThis.TextEncoder === undefined) {
  Object.assign(globalThis, { TextDecoder, TextEncoder });
}
