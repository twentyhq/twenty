import { createHash } from 'crypto';

import * as jwt from 'jsonwebtoken';

import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';

// Mirrors JwtWrapperService.generateAppSecret + extractAppSecretBody so tests
// can hand-craft tokens that match what a pre-2.5 server would have signed.
// extractAppSecretBody resolves to workspaceId when present, else userId.
const HS256_APP_SECRET = 'replace_me_with_a_random_string';

const generateLegacyHs256Secret = (
  type: JwtTokenTypeEnum,
  appSecretBody: string,
): string =>
  createHash('sha256')
    .update(`${HS256_APP_SECRET}${appSecretBody}${type}`)
    .digest('hex');

export const forgeLegacyHs256Token = <TPayload extends Record<string, unknown>>(
  payload: TPayload & { type: JwtTokenTypeEnum },
  appSecretBody: string,
  options: jwt.SignOptions = { expiresIn: '5m' },
): string =>
  jwt.sign(payload, generateLegacyHs256Secret(payload.type, appSecretBody), {
    algorithm: 'HS256',
    ...options,
  });
