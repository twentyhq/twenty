import { posix } from 'path';

// Storage resource paths are always forward-slash separated regardless of the
// host OS: the file-storage validator rejects backslashes outright.
export const posixJoin = (...segments: string[]): string =>
  posix.join(...segments);
