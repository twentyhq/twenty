import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'node:util';

// jsdom has no TextEncoder/TextDecoder, and react-router (reached through
// twenty-shared/utils) references them while being imported.
if (globalThis.TextEncoder === undefined) {
  Object.assign(globalThis, { TextDecoder, TextEncoder });
}
