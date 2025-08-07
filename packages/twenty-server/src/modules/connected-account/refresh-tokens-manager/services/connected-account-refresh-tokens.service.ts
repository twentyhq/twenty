import { Injectable, Logger } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

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
import { isAxiosTemporaryError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/is-axios-gaxios-error.util';

export type ConnectedAccountTokens = GoogleTokens | MicrosoftTokens;

@Injectable()
export class ConnectedAccountRefreshTokensService {
  private readonly logger = new Logger(
    ConnectedAccountRefreshTokensService.name,
  );

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
          return await this.googleAPIRefreshAccessTokenService.refreshAccessToken(
            refreshToken,
          );
        case ConnectedAccountProvider.MICROSOFT:
          return await this.microsoftAPIRefreshAccessTokenService.refreshTokens(
            refreshToken,
          );
        case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
          throw new ConnectedAccountRefreshAccessTokenException(
            `Token refresh is not supported for IMAP provider for connected account ${connectedAccount.id} in workspace ${workspaceId}`,
            ConnectedAccountRefreshAccessTokenExceptionCode.REFRESH_ACCESS_TOKEN_FAILED,
          );
        default:
          return assertUnreachable(
            connectedAccount.provider,
            `Provider ${connectedAccount.provider} not supported`,
          );
      }
    } catch (error) {
      if (error?.name === 'AggregateError') {
        const firstError = error?.errors?.[0];

        this.logger.log(firstError);

        if (isAxiosTemporaryError(error)) {
          throw new ConnectedAccountRefreshAccessTokenException(
            `Error refreshing tokens for connected account ${connectedAccount.id.slice(0, 7)} in workspace ${workspaceId.slice(0, 7)}: ${firstError.code}`,
            ConnectedAccountRefreshAccessTokenExceptionCode.TEMPORARY_NETWORK_ERROR,
          );
        }
      }

      if (isAxiosTemporaryError(error)) {
        throw new ConnectedAccountRefreshAccessTokenException(
          `Error refreshing tokens for connected account ${connectedAccount.id.slice(0, 7)} in workspace ${workspaceId.slice(0, 7)}: ${error.code}`,
          ConnectedAccountRefreshAccessTokenExceptionCode.TEMPORARY_NETWORK_ERROR,
        );
      }

      this.logger.log(
        `Error while refreshing tokens on connected account ${connectedAccount.id.slice(0, 7)} in workspace ${workspaceId.slice(0, 7)}`,
        error,
      );
      throw new ConnectedAccountRefreshAccessTokenException(
        `Error refreshing tokens for connected account ${connectedAccount.id.slice(0, 7)} in workspace ${workspaceId.slice(0, 7)}: ${error.message} ${error?.response?.data?.error_description}`,
        ConnectedAccountRefreshAccessTokenExceptionCode.REFRESH_ACCESS_TOKEN_FAILED,
      );
    }
  }
}
