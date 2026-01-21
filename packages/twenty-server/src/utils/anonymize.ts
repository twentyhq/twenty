import crypto from 'crypto';

export const anonymize = (input: string): string => {
  if (typeof input !== 'string') {
    throw new Error(
      `Invalid input type: expected string, got ${typeof input}`,
    );
  }

  // md5 shorter than sha-256 and collisions are not a security risk in this use-case
  return crypto.createHash('md5').update(input).digest('hex');
};
