import { randomBytes } from 'crypto';

export const generateWebhookSecret = (): string => {
  return randomBytes(32).toString('hex');
};
