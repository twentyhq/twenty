import { Injectable } from '@nestjs/common';

import axios from 'axios';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { NewTokens } from 'src/modules/connected-account/refresh-tokens-manager/services/refresh-tokens.service';

@Injectable()
export class MicrosoftAPIRefreshAccessTokenService {
  constructor(private readonly environmentService: EnvironmentService) {}

  async refreshTokens(refreshToken: string): Promise<NewTokens> {
    const response = await axios.post(
      'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      new URLSearchParams({
        client_id: this.environmentService.get('AUTH_MICROSOFT_CLIENT_ID'),
        client_secret: this.environmentService.get(
          'AUTH_MICROSOFT_CLIENT_SECRET',
        ),
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    return {
      newAccessToken: response.data.access_token,
      newRefreshToken: response.data.refresh_token,
    };
  }
}
