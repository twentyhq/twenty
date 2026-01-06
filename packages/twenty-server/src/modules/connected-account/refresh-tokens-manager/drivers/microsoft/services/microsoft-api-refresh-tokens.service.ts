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
      });

      if (!response) {
        throw new ConnectedAccountRefreshAccessTokenException(
          'No response received from Microsoft token endpoint',
          ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
        );
      }

      return {
        accessToken: response.accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof ConnectedAccountRefreshAccessTokenException) {
        throw error;
      }

      throw parseMsalError(error);
    }
  }
}
