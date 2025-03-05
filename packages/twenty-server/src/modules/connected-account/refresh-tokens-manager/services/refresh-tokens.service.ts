import { Injectable } from '@nestjs/common';

import { assertUnreachable, ConnectedAccountProvider } from 'twenty-shared';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/refresh-tokens-manager/drivers/google/services/google-api-refresh-access-token.service';
import { MicrosoftAPIRefreshAccessTokenService } from 'src/modules/connected-account/refresh-tokens-manager/drivers/microsoft/services/microsoft-api-refresh-tokens.service';
import {
  RefreshAccessTokenException,
  RefreshAccessTokenExceptionCode,
} from 'src/modules/connected-account/refresh-tokens-manager/exceptions/refresh-tokens.exception';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

export type NewTokens = {
  newAccessToken: string;
  newRefreshToken?: string;
};

@Injectable()
export class RefreshTokensService {
  constructor(
    private readonly googleAPIRefreshAccessTokenService: GoogleAPIRefreshAccessTokenService,
    private readonly microsoftAPIRefreshAccessTokenService: MicrosoftAPIRefreshAccessTokenService,
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

  async refreshAndSaveTokens(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ): Promise<string> {
    const refreshToken = connectedAccount.refreshToken;

    if (!refreshToken) {
      throw new RefreshAccessTokenException(
        `No refresh token found for connected account ${connectedAccount.id} in workspace ${workspaceId}`,
        RefreshAccessTokenExceptionCode.REFRESH_TOKEN_NOT_FOUND,
      );
    }

    switch (connectedAccount.provider) {
      case 'microsoft':
      case 'google': {
        let newAccessToken: string;
        let newRefreshToken: string | undefined;

        try {
          const tokenObject = await this.refreshTokens(
            connectedAccount,
            refreshToken,
          );

          newAccessToken = tokenObject.newAccessToken;
          newRefreshToken = tokenObject.newRefreshToken;
        } catch (error) {
          throw new RefreshAccessTokenException(
            `Error refreshing access token for connected account ${connectedAccount.id} in workspace ${workspaceId}: ${error.message} ${error?.response?.data?.error_description}`,
            RefreshAccessTokenExceptionCode.REFRESH_ACCESS_TOKEN_FAILED,
          );
        }

        const connectedAccountRepository =
          await this.twentyORMManager.getRepository<ConnectedAccountWorkspaceEntity>(
            'connectedAccount',
          );

        if (newRefreshToken) {
          await connectedAccountRepository.update(
            { id: connectedAccount.id },
            {
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            },
          );
        } else {
          await connectedAccountRepository.update(
            { id: connectedAccount.id },
            {
              accessToken: newAccessToken,
            },
          );
        }

        return newAccessToken;
      }
      default:
        return assertUnreachable(
          connectedAccount.provider,
          `Provider ${connectedAccount.provider} not supported for access token refresh`,
        );
    }
  }

  async refreshTokens(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    refreshToken: string,
  ): Promise<NewTokens> {
    switch (connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE:
        return this.googleAPIRefreshAccessTokenService.refreshAccessToken(
          refreshToken,
        );
      case ConnectedAccountProvider.MICROSOFT:
        return this.microsoftAPIRefreshAccessTokenService.refreshTokens(
          refreshToken,
        );
      default:
        return assertUnreachable(
          connectedAccount.provider,
          `Provider ${connectedAccount.provider} not supported`,
        );
    }
  }
}
