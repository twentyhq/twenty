import { Injectable, Logger } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/refresh-tokens-manager/drivers/google/services/google-api-refresh-tokens.service';
import { MicrosoftAPIRefreshAccessTokenService } from 'src/modules/connected-account/refresh-tokens-manager/drivers/microsoft/services/microsoft-api-refresh-tokens.service';
import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/modules/connected-account/refresh-tokens-manager/exceptions/connected-account-refresh-tokens.exception';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { isGmailNetworkError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/is-gmail-network-error.util';

export type ConnectedAccountTokens = {
  accessToken: string;
  refreshToken: string;
};

const CONNECTED_ACCOUNT_ACCESS_TOKEN_EXPIRATION = 1000 * 60 * 60;

@Injectable()
export class ConnectedAccountRefreshTokensService {
  private readonly logger = new Logger(
    ConnectedAccountRefreshTokensService.name,
  );

  constructor(
    private readonly googleAPIRefreshAccessTokenService: GoogleAPIRefreshAccessTokenService,
    private readonly microsoftAPIRefreshAccessTokenService: MicrosoftAPIRefreshAccessTokenService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async refreshAndSaveTokens(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ): Promise<ConnectedAccountTokens> {
    const { refreshToken, accessToken } = connectedAccount;

    if (!refreshToken) {
      throw new ConnectedAccountRefreshAccessTokenException(
        `No refresh token found for connected account ${connectedAccount.id} in workspace ${workspaceId}`,
        ConnectedAccountRefreshAccessTokenExceptionCode.REFRESH_TOKEN_NOT_FOUND,
      );
    }

    const isAccessTokenValid =
      await this.isAccessTokenStillValid(connectedAccount);

    if (isAccessTokenValid) {
      this.logger.debug(
        `Reusing valid access token for connected account ${connectedAccount.id.slice(0, 7)} in workspace ${workspaceId.slice(0, 7)}`,
      );
      if (!isDefined(accessToken)) {
        throw new ConnectedAccountRefreshAccessTokenException(
          `Access token is required for connected account ${connectedAccount.id} in workspace ${workspaceId}`,
          ConnectedAccountRefreshAccessTokenExceptionCode.ACCESS_TOKEN_NOT_FOUND,
        );
      }

      return {
        accessToken,
        refreshToken,
      };
    }

    this.logger.log(
      `Access token expired for connected account ${connectedAccount.id.slice(0, 7)} in workspace ${workspaceId.slice(0, 7)}, refreshing...`,
    );

    const connectedAccountTokens = await this.refreshTokens(
      connectedAccount,
      refreshToken,
      workspaceId,
    );

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const connectedAccountRepository =
          await this.globalWorkspaceOrmManager.getRepository<ConnectedAccountWorkspaceEntity>(
            workspaceId,
            'connectedAccount',
          );

        await connectedAccountRepository.update(
          { id: connectedAccount.id },
          {
            ...connectedAccountTokens,
            lastCredentialsRefreshedAt: new Date(),
          },
        );
      },
    );

    return connectedAccountTokens;
  }

  async isAccessTokenStillValid(
    connectedAccount: ConnectedAccountWorkspaceEntity,
  ): Promise<boolean> {
    switch (connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE:
      case ConnectedAccountProvider.MICROSOFT: {
        if (!connectedAccount.lastCredentialsRefreshedAt) {
          return false;
        }

        const BUFFER_TIME = 5 * 60 * 1000;

        const tokenExpirationTime =
          CONNECTED_ACCOUNT_ACCESS_TOKEN_EXPIRATION - BUFFER_TIME;

        return (
          connectedAccount.lastCredentialsRefreshedAt >
          new Date(Date.now() - tokenExpirationTime)
        );
      }
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
        return true;
      default:
        return assertUnreachable(
          connectedAccount.provider,
          `Provider ${connectedAccount.provider} not supported`,
        );
    }
  }

  async refreshTokens(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    refreshToken: string,
    workspaceId: string,
  ): Promise<ConnectedAccountTokens> {
    try {
      switch (connectedAccount.provider) {
        case ConnectedAccountProvider.GOOGLE:
          return await this.googleAPIRefreshAccessTokenService.refreshTokens(
            refreshToken,
          );
        case ConnectedAccountProvider.MICROSOFT:
          return await this.microsoftAPIRefreshAccessTokenService.refreshTokens(
            refreshToken,
          );
        case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
          throw new ConnectedAccountRefreshAccessTokenException(
            `Token refresh is not supported for IMAP provider for connected account ${connectedAccount.id} in workspace ${workspaceId}`,
            ConnectedAccountRefreshAccessTokenExceptionCode.PROVIDER_NOT_SUPPORTED,
          );
        default:
          return assertUnreachable(
            connectedAccount.provider,
            `Provider ${connectedAccount.provider} not supported`,
          );
      }
    } catch (error) {
      if (isGmailNetworkError(error)) {
        throw new ConnectedAccountRefreshAccessTokenException(
          `Error refreshing tokens for connected account ${connectedAccount.id.slice(0, 7)} in workspace ${workspaceId.slice(0, 7)}: ${error.code}`,
          ConnectedAccountRefreshAccessTokenExceptionCode.TEMPORARY_NETWORK_ERROR,
        );
      }

      this.logger.log(
        `Error while refreshing tokens on connected account ${connectedAccount.id.slice(0, 7)} in workspace ${workspaceId.slice(0, 7)}`,
        error,
      );
      throw error;
    }
  }
}
