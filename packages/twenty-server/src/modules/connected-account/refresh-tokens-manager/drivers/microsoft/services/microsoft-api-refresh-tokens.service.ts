import { Injectable } from '@nestjs/common';

import { ConfidentialClientApplication } from '@azure/msal-node';

import type { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/modules/connected-account/refresh-tokens-manager/exceptions/connected-account-refresh-tokens.exception';
import type { ConnectedAccountTokens } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';
import { parseMsalError } from 'src/modules/connected-account/refresh-tokens-manager/drivers/microsoft/utils/parse-msal-error.util';

@Injectable()
export class MicrosoftAPIRefreshAccessTokenService {
  private msalClient: ConfidentialClientApplication;

  constructor(private readonly config: TwentyConfigService) {
    this.msalClient = new ConfidentialClientApplication({
      auth: {
        clientId: this.config.get('AUTH_MICROSOFT_CLIENT_ID'),
        clientSecret: this.config.get('AUTH_MICROSOFT_CLIENT_SECRET'),
        authority: 'https://login.microsoftonline.com/common',
      },
    });
  }

  async refreshTokens(refreshToken: string): Promise<ConnectedAccountTokens> {
    try {
      const response = await this.msalClient.acquireTokenByRefreshToken({
        refreshToken,
        scopes: ['https://graph.microsoft.com/.default'],
        forceCache: true,
      });

      if (!response) {
        throw new ConnectedAccountRefreshAccessTokenException(
          'No response received from Microsoft token endpoint',
          ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
        );
      }

      const freshRefreshToken = this.extractMicrosoftRefreshTokenFromCache();

      return {
        accessToken: response.accessToken,
        refreshToken: freshRefreshToken,
      };
    } catch (error) {
      if (error instanceof ConnectedAccountRefreshAccessTokenException) {
        throw error;
      }

      throw parseMsalError(error);
    }
  }

  /**
   * Extracts the refresh token from the MSAL token cache.
   * @see https://github.com/duolingo/metasearch/blob/3d782bba8c0068461acb442d89e7d555df5d0025/src/oauth.microsoft.ts#L42-L44
   */
  private extractMicrosoftRefreshTokenFromCache(): string {
    const tokenCache = JSON.parse(this.msalClient.getTokenCache().serialize());
    const refreshTokenKey = Object.keys(tokenCache.RefreshToken)[0];

    return tokenCache.RefreshToken[refreshTokenKey].secret;
  }
}
