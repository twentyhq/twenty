import crypto from 'crypto';

export const computeBuiltCodeChecksum = (
  builtCode: string | Buffer,
): string => {
  return crypto.createHash('md5').update(builtCode).digest('hex');
};
