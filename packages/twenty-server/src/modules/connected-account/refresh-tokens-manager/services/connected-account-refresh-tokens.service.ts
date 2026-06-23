import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { AppOAuthRefreshAccessTokenService } from 'src/engine/core-modules/application/connection-provider/refresh/services/app-oauth-refresh-tokens.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/refresh-tokens-manager/drivers/google/services/google-api-refresh-tokens.service';
import { MicrosoftAPIRefreshAccessTokenService } from 'src/modules/connected-account/refresh-tokens-manager/drivers/microsoft/services/microsoft-api-refresh-tokens.service';

export type ConnectedAccountTokens = {
  accessToken: string;
  refreshToken: string | null;
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
    private readonly appOAuthRefreshAccessTokenService: AppOAuthRefreshAccessTokenService,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
  ) {}

  async resolveTokens(
    connectedAccount: ConnectedAccountEntity,
    workspaceId: string,
  ): Promise<ConnectedAccountTokens> {
    const isAccessTokenValid =
      await this.isAccessTokenStillValid(connectedAccount);

    if (isAccessTokenValid) {
      this.logger.debug(
        `Reusing valid access token for connected account ${connectedAccount.id.slice(0, 7)} in workspace ${workspaceId.slice(0, 7)}`,
      );

      return this.getExistingEncryptedTokens(connectedAccount, workspaceId);
    }

    const encryptedRefreshToken = connectedAccount.refreshToken;

    if (!isDefined(encryptedRefreshToken)) {
      throw new ConnectedAccountRefreshAccessTokenException(
        `No refresh token found for connected account ${connectedAccount.id} in workspace ${workspaceId}`,
        ConnectedAccountRefreshAccessTokenExceptionCode.REFRESH_TOKEN_NOT_FOUND,
      );
    }

    this.logger.debug(
      `Access token expired for connected account ${connectedAccount.id} in workspace ${workspaceId}, refreshing...`,
    );

    return this.performRefreshAndSave(
      connectedAccount,
      encryptedRefreshToken,
      workspaceId,
    );
  }

  private getExistingEncryptedTokens(
    connectedAccount: ConnectedAccountEntity,
    workspaceId: string,
  ): ConnectedAccountTokens {
    if (!isDefined(connectedAccount.accessToken)) {
      throw new ConnectedAccountRefreshAccessTokenException(
        `Access token is required for connected account ${connectedAccount.id} in workspace ${workspaceId}`,
        ConnectedAccountRefreshAccessTokenExceptionCode.ACCESS_TOKEN_NOT_FOUND,
      );
    }

    return {
      accessToken: connectedAccount.accessToken,
      refreshToken: connectedAccount.refreshToken,
    };
  }

  private async performRefreshAndSave(
    connectedAccount: ConnectedAccountEntity,
    encryptedRefreshToken: string,
    workspaceId: string,
  ): Promise<ConnectedAccountTokens> {
    const decryptedRefreshToken =
      this.connectedAccountTokenEncryptionService.decrypt({
        ciphertext: encryptedRefreshToken,
        workspaceId,
      });

    const plaintextTokens = await this.refreshTokens(
      connectedAccount,
      decryptedRefreshToken,
      workspaceId,
    );

    const {
      encryptedAccessToken,
      encryptedRefreshToken: reEncryptedRefreshToken,
    } = this.connectedAccountTokenEncryptionService.encryptTokenPair({
      accessToken: plaintextTokens.accessToken,
      refreshToken: plaintextTokens.refreshToken,
      workspaceId,
    });

    await this.connectedAccountRepository.update(
      { id: connectedAccount.id, workspaceId },
      {
        accessToken: encryptedAccessToken,
        refreshToken: reEncryptedRefreshToken,
        lastCredentialsRefreshedAt: new Date(),
      },
    );

    return {
      accessToken: encryptedAccessToken,
      refreshToken: reEncryptedRefreshToken,
    };
  }

  async isAccessTokenStillValid(
    connectedAccount: ConnectedAccountEntity,
  ): Promise<boolean> {
    switch (connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE:
      case ConnectedAccountProvider.MICROSOFT:
      case ConnectedAccountProvider.APP: {
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
      case ConnectedAccountProvider.OIDC:
      case ConnectedAccountProvider.SAML:
      case ConnectedAccountProvider.EMAIL_GROUP:
        return true;
      default:
        return assertUnreachable(
          connectedAccount.provider,
          `Provider ${connectedAccount.provider} not supported`,
        );
    }
  }

  async refreshTokens(
    connectedAccount: ConnectedAccountEntity,
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
        case ConnectedAccountProvider.APP:
          return await this.appOAuthRefreshAccessTokenService.refreshTokens(
            connectedAccount,
            refreshToken,
          );
        case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
        case ConnectedAccountProvider.OIDC:
        case ConnectedAccountProvider.SAML:
        case ConnectedAccountProvider.EMAIL_GROUP:
          throw new ConnectedAccountRefreshAccessTokenException(
            `Token refresh is not supported for ${connectedAccount.provider} provider for connected account ${connectedAccount.id} in workspace ${workspaceId}`,
            ConnectedAccountRefreshAccessTokenExceptionCode.PROVIDER_NOT_SUPPORTED,
          );
        default:
          return assertUnreachable(
            connectedAccount.provider,
            `Provider ${connectedAccount.provider} not supported`,
          );
      }
    } catch (error) {
      if (error instanceof ConnectedAccountRefreshAccessTokenException) {
        this.logger.warn(
          `Token refresh failed for provider ${connectedAccount.provider} on connected account ${connectedAccount.id} in workspace ${workspaceId} with code ${error.code}`,
        );

        if (
          connectedAccount.provider === ConnectedAccountProvider.MICROSOFT &&
          error.code ===
            ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN
        ) {
          this.logger.warn(
            `Microsoft token refresh failed with INVALID_REFRESH_TOKEN for connected account ${connectedAccount.id} in workspace ${workspaceId}. Verify OAuth app credentials are configured in this runtime.`,
          );
        }

        throw error;
      }

      this.logger.error(
        `Unexpected token refresh error for provider ${connectedAccount.provider} on connected account ${connectedAccount.id} in workspace ${workspaceId}`,
        error,
      );

      throw error;
    }
  }
}
