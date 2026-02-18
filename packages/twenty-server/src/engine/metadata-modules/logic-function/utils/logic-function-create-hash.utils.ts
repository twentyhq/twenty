import { createHash } from 'crypto';

// TODO: migrate to twenty-shared and spread everywhere
export const logicFunctionCreateHash = (fileContent: string) => {
  return createHash('sha512')
    .update(fileContent)
    .digest('hex')
    .substring(0, 32);
};
