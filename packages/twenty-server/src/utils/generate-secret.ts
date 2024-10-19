import { ConfigService } from '@nestjs/config';

import { createHash } from 'crypto';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

export const generateSecret = (
  workspaceId: string,
  type: 'ACCESS' | 'LOGIN' | 'REFRESH' | 'FILE',
): string => {
  const appSecret = new EnvironmentService(new ConfigService()).get(
    'APP_SECRET',
  );

  if (!appSecret) {
    throw new Error('APP_SECRET is not set');
  }

  return createHash('sha256')
    .update(`${appSecret}${workspaceId}${type}`)
    .digest('hex');
};
