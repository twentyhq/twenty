import { createHash } from 'crypto';

export const computeTypeReferencesChecksum = (content: Buffer): string =>
  createHash('sha256').update(content).digest('hex');
