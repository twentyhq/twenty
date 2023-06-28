import crypto from 'crypto';

export function anonymize(input) {
  if (process.env.IS_TELEMETRY_ANONYMIZATION_ENABLED === 'false') {
    return input;
  }
  // md5 shorter than sha-256 and collisions are not a security risk in this use-case
  return crypto.createHash('md5').update(input).digest('hex');
}
