import { serverlessFunctionCreateHash } from 'src/engine/metadata-modules/serverless-function/utils/serverless-function-create-hash.utils';

export const serverlessFunctionCreateCodeChecksum = (code: JSON): string => {
  if (!code || typeof code !== 'object') {
    return serverlessFunctionCreateHash('');
  }

  const codeObj = code as unknown as Record<string, string>;
  const sortedKeys = Object.keys(codeObj).sort();
  const concatenatedContent = sortedKeys
    .map((key) => `${key}:${codeObj[key]}`)
    .join('|');

  return serverlessFunctionCreateHash(concatenatedContent);
};
