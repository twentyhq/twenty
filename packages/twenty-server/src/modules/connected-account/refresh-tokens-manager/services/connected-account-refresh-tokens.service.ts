import { Injectable } from '@nestjs/common';

import { assertUnreachable, ConnectedAccountProvider } from 'twenty-shared';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import {
  GoogleAPIRefreshAccessTokenService,
  GoogleTokens,
} from 'src/modules/connected-account/refresh-tokens-manager/drivers/google/services/google-api-refresh-access-token.service';
import {
  MicrosoftAPIRefreshAccessTokenService,
  MicrosoftTokens,
} from 'src/modules/connected-account/refresh-tokens-manager/drivers/microsoft/services/microsoft-api-refresh-tokens.service';
import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/modules/connected-account/refresh-tokens-manager/exceptions/connected-account-refresh-tokens.exception';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

export type ConnectedAccountTokens = GoogleTokens | MicrosoftTokens;

@Injectable()
export class ConnectedAccountRefreshTokensService {
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
      throw new ConnectedAccountRefreshAccessTokenException(
        `No refresh token found for connected account ${connectedAccount.id} in workspace ${workspaceId}`,
        ConnectedAccountRefreshAccessTokenExceptionCode.REFRESH_TOKEN_NOT_FOUND,
      );
    }

    const connectedAccountTokens = await this.refreshTokens(
      connectedAccount,
      refreshToken,
      workspaceId,
    );

    try {
      const connectedAccountRepository =
        await this.twentyORMManager.getRepository<ConnectedAccountWorkspaceEntity>(
          'connectedAccount',
        );

      await connectedAccountRepository.update(
        { id: connectedAccount.id },
        connectedAccountTokens,
      );
    } catch (error) {
      throw new Error(
        `Error saving the new tokens for connected account ${connectedAccount.id} in workspace ${workspaceId}: ${error.message} `,
      );
    }

    return connectedAccountTokens.accessToken;
  }

  async refreshTokens(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    refreshToken: string,
    workspaceId: string,
  ): Promise<ConnectedAccountTokens> {
    try {
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
    } catch (error) {
      throw new ConnectedAccountRefreshAccessTokenException(
        `Error refreshing tokens for connected account ${connectedAccount.id} in workspace ${workspaceId}: ${error.message} ${error?.response?.data?.error_description}`,
        ConnectedAccountRefreshAccessTokenExceptionCode.REFRESH_ACCESS_TOKEN_FAILED,
      );
    }
  }
}
