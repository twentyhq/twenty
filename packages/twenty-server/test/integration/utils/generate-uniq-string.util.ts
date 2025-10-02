import { randomBytes } from 'crypto';

export const uniqString = randomBytes(16).toString('hex');
