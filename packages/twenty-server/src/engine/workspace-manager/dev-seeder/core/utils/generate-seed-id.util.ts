import { createHash } from 'crypto';

export const generateSeedId = (
  workspaceId: string,
  seedName: string,
): string => {
  const hash = createHash('sha256')
    .update(`${workspaceId}-${seedName}`)
    .digest('hex');

  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '4' + hash.substring(13, 16),
    ((parseInt(hash.substring(16, 17), 16) & 0x3) | 0x8).toString(16) +
      hash.substring(17, 20),
    hash.substring(20, 32),
  ].join('-');
};
