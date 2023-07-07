import crypto from 'crypto';

export function anonymize(input: string) {
  // md5 shorter than sha-256 and collisions are not a security risk in this use-case
  return crypto.createHash('md5').update(input).digest('hex');
}
