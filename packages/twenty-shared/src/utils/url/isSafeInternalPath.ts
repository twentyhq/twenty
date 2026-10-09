import { isNonEmptyString } from '@sniptt/guards';

// A leading '#' only moves the hash, so it cannot leave the app either
export const isSafeInternalPath = (path: string): boolean =>
  isNonEmptyString(path) &&
  (path.startsWith('/') || path.startsWith('#')) &&
  !path.startsWith('//') &&
  !path.includes('\\') &&
  !/[\u0000-\u001f\u007f]/u.test(path);
