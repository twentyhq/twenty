import { randomBytes } from 'node:crypto';

export const buildUniqueMetadataName = (prefix: string) =>
  `${prefix}${Array.from(randomBytes(8), (byte) =>
    String.fromCharCode(97 + (byte % 26)),
  ).join('')}`;
