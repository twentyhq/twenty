import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { AppOAuthRefreshAccessTokenService } from 'src/engine/core-modules/application/connection-provider/refresh/services/app-oauth-refresh-tokens.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/refresh-tokens-manager/drivers/google/services/google-api-refresh-tokens.service';
import { MicrosoftAPIRefreshAccessTokenService } from 'src/modules/connected-account/refresh-tokens-manager/drivers/microsoft/services/microsoft-api-refresh-tokens.service';
import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';

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
    private readonly appOAuthRefreshAccessTokenService: AppOAuthRefreshAccessTokenService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
  ) {}

  async refreshAndSaveTokens(
    connectedAccount: ConnectedAccountEntity,
    workspaceId: string,
  ): Promise<ConnectedAccountTokens> {
    // Entity values are ciphertext (enc:v1:...) — decryption happens at the
    // moment of use, never earlier. The destructured locals hold ciphertext
    // until just before they're handed to the IDP or returned to the caller.
    const {
      refreshToken: encryptedRefreshToken,
      accessToken: encryptedAccessToken,
    } = connectedAccount;

    if (!encryptedRefreshToken) {
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
      if (!isDefined(encryptedAccessToken)) {
        throw new ConnectedAccountRefreshAccessTokenException(
          `Access token is required for connected account ${connectedAccount.id} in workspace ${workspaceId}`,
          ConnectedAccountRefreshAccessTokenExceptionCode.ACCESS_TOKEN_NOT_FOUND,
        );
      }

      // Decrypt right at the return — callers (eg. the OAuth client manager,
      // application-connections-list, message/calendar workers) consume
      // these as bearer tokens and must receive plaintext.
      return {
        accessToken:
          this.connectedAccountTokenEncryptionService.decrypt(
            encryptedAccessToken,
          ),
        refreshToken: this.connectedAccountTokenEncryptionService.decrypt(
          encryptedRefreshToken,
        ),
      };
    }

    this.logger.debug(
      `Access token expired for connected account ${connectedAccount.id} in workspace ${workspaceId}, refreshing...`,
    );

    // Decrypt only for the IDP call — the provider needs the plaintext
    // refresh token to mint a new access token. The plaintext doesn't
    // outlive this.refreshTokens() call.
    const decryptedRefreshTokenForRefreshCall =
      this.connectedAccountTokenEncryptionService.decrypt(
        encryptedRefreshToken,
      );

    const connectedAccountTokens = await this.refreshTokens(
      connectedAccount,
      decryptedRefreshTokenForRefreshCall,
      workspaceId,
    );

    // Re-encrypt the freshly-rotated tokens before they touch the entity or
    // the SQL — the update below must never write plaintext.
    const reEncryptedAccessToken =
      this.connectedAccountTokenEncryptionService.encrypt(
        connectedAccountTokens.accessToken,
      );
    const reEncryptedRefreshToken =
      this.connectedAccountTokenEncryptionService.encrypt(
        connectedAccountTokens.refreshToken,
      );

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.connectedAccountRepository.update(
        { id: connectedAccount.id, workspaceId },
        {
          accessToken: reEncryptedAccessToken,
          refreshToken: reEncryptedRefreshToken,
          lastCredentialsRefreshedAt: new Date(),
        },
      );
    }, authContext);

    // Caller still needs plaintext to actually use the new token immediately.
    return connectedAccountTokens;
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
      this.logger.log(
        `Error while refreshing tokens on connected account ${connectedAccount.id} in workspace ${workspaceId}`,
        error,
      );
      throw error;
    }
  }
}
