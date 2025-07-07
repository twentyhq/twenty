import { Injectable, Logger } from '@nestjs/common';

import {
  AuthProvider,
  AuthProviderCallback,
  Client,
} from '@microsoft/microsoft-graph-client';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { ConnectedAccountRefreshAccessTokenExceptionCode } from 'src/modules/connected-account/refresh-tokens-manager/exceptions/connected-account-refresh-tokens.exception';

@Injectable()
export class MicrosoftOAuth2ClientManagerService {
  private readonly logger = new Logger(
    MicrosoftOAuth2ClientManagerService.name,
  );
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  public async getOAuth2Client(refreshToken: string): Promise<Client> {
    const authProvider: AuthProvider = async (
      callback: AuthProviderCallback,
    ) => {
      try {
        const urlData = new URLSearchParams();

        urlData.append(
          'client_id',
          this.twentyConfigService.get('AUTH_MICROSOFT_CLIENT_ID'),
        );
        urlData.append('scope', 'https://graph.microsoft.com/.default');
        urlData.append('refresh_token', refreshToken);
        urlData.append(
          'client_secret',
          this.twentyConfigService.get('AUTH_MICROSOFT_CLIENT_SECRET'),
        );
        urlData.append('grant_type', 'refresh_token');

        const res = await fetch(
          `https://login.microsoftonline.com/common/oauth2/v2.0/token`,
          {
            method: 'POST',
            body: urlData,
          },
        );

        const data = await res.json();

        if (!res.ok) {
          if (data) {
            const accessTokenSliced = data?.access_token?.slice(0, 10);
            const refreshTokenSliced = data?.refresh_token?.slice(0, 10);

            delete data.access_token;
            delete data.refresh_token;
            this.logger.error(data);
            this.logger.error(`accessTokenSliced: ${accessTokenSliced}`);
            this.logger.error(`refreshTokenSliced: ${refreshTokenSliced}`);
          }

          this.logger.error(res);
          throw new Error(
            `${MicrosoftOAuth2ClientManagerService.name} error: ${ConnectedAccountRefreshAccessTokenExceptionCode.REFRESH_ACCESS_TOKEN_FAILED}`,
          );
        }

        callback(null, data.access_token);
      } catch (error) {
        callback(error, null);
      }
    };

    const client = Client.init({
      defaultVersion: 'v1.0',
      debugLogging: false,
      authProvider: authProvider,
    });

    return client;
  }
}
