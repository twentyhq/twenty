import { createHash } from 'crypto';

export const generateDeterministicIndexName = (columns: string[]): string => {
  const hash = createHash('sha256');

  columns.forEach((column) => {
    hash.update(column);
  });

  return hash.digest('hex').slice(0, 27);
};
