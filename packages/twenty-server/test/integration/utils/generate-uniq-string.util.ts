import { randomBytes } from 'crypto';

export const generateUniqString = () => randomBytes(16).toString('hex');
