import { extname } from 'node:path';

const ALLOWED_EXTENSIONS = new Set(['', '.ics', '.eml']);

export const isValidCalDavHref = (url: string): boolean =>
  ALLOWED_EXTENSIONS.has(extname(url).toLowerCase());
