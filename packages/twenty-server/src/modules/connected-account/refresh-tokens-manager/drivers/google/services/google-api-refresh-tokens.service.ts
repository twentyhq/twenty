import { Injectable } from '@nestjs/common';

import { isDefined } from 'class-validator';
import { google } from 'googleapis';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/modules/connected-account/refresh-tokens-manager/exceptions/connected-account-refresh-tokens.exception';
import { type ConnectedAccountTokens } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';

@Injectable()
export class GoogleAPIRefreshAccessTokenService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  async refreshTokens(refreshToken: string): Promise<ConnectedAccountTokens> {
    const oAuth2Client = new google.auth.OAuth2(
      this.twentyConfigService.get('AUTH_GOOGLE_CLIENT_ID'),
      this.twentyConfigService.get('AUTH_GOOGLE_CLIENT_SECRET'),
    );

    oAuth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const { token } = await oAuth2Client.getAccessToken();

    if (!isDefined(token)) {
      throw new ConnectedAccountRefreshAccessTokenException(
        'Failed to refresh google access token',
        ConnectedAccountRefreshAccessTokenExceptionCode.REFRESH_ACCESS_TOKEN_FAILED,
      );
    }

    return {
      accessToken: token as string,
      refreshToken,
    };
  }
}
