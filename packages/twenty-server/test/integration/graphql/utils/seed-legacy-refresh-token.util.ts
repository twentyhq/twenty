import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { type JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Refresh tokens are no longer minted, so tests recreate one the way the server used to issue it.
export const seedLegacyRefreshToken = async ({
  userId,
  workspaceId,
  expiresAt = new Date(Date.now() + ONE_DAY_MS),
  revokedAt = null,
  deletedAt = null,
}: {
  userId: string;
  workspaceId?: string;
  expiresAt?: Date;
  revokedAt?: Date | null;
  deletedAt?: Date | null;
}): Promise<{ refreshToken: string; appTokenId: string }> => {
  const appTokenRepository = getCoreRepository<AppTokenEntity>(AppTokenEntity);

  const appToken = await appTokenRepository.save(
    appTokenRepository.create({
      userId,
      workspaceId: workspaceId ?? null,
      type: AppTokenType.RefreshToken,
      expiresAt,
      revokedAt,
      deletedAt,
    }),
  );

  const refreshToken = await getAppProviderByClassName<JwtWrapperService>(
    'JwtWrapperService',
  ).signAsyncOrThrow(
    {
      sub: userId,
      userId,
      workspaceId,
      authProvider: AuthProviderEnum.Password,
      targetedTokenType: workspaceId
        ? JwtTokenTypeEnum.ACCESS
        : JwtTokenTypeEnum.WORKSPACE_AGNOSTIC,
      type: JwtTokenTypeEnum.REFRESH,
    },
    { expiresIn: '1d', jwtid: appToken.id },
  );

  return { refreshToken, appTokenId: appToken.id };
};
