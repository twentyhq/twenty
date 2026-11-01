import { gzipSync } from 'node:zlib';

export const encodeFrontComponentTypeReferences = (
  files: Record<string, string>,
): Buffer => gzipSync(JSON.stringify(files));
