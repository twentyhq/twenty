import { createHash } from 'crypto';

if (!process.env.APP_SECRET) {
  throw new Error('APP_SECRET is not set');
}

export const generateSecret = (
  workspaceId: string,
  type: 'ACCESS' | 'LOGIN' | 'REFRESH' | 'FILE',
): string => {
  return createHash('sha256')
    .update(`${process.env.APP_SECRET}${workspaceId}${type}`)
    .digest('hex');
};
