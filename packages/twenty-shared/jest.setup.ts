// jsdom lacks TextEncoder/TextDecoder, which @noble/hashes needs.
import { TextDecoder, TextEncoder } from 'node:util';

Object.assign(globalThis, { TextDecoder, TextEncoder });
