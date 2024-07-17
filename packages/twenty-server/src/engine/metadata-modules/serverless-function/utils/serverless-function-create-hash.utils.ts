import { createHash } from 'crypto';

export const serverlessFunctionCreateHash = (fileContent: string) => {
  return createHash('sha512')
    .update(fileContent)
    .digest('hex')
    .substring(0, 32);
};
