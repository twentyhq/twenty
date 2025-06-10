import { Injectable } from '@nestjs/common';

import axios from 'axios';
import { z } from 'zod';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export type MicrosoftTokens = {
  accessToken: string;
  refreshToken: string;
};

interface MicrosoftRefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expires_in: number;
  id_token?: string;
}
@Injectable()
export class MicrosoftAPIRefreshAccessTokenService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  async refreshTokens(refreshToken: string): Promise<MicrosoftTokens> {
    const response = await axios.post<MicrosoftRefreshTokenResponse>(
      'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      new URLSearchParams({
        client_id: this.twentyConfigService.get('AUTH_MICROSOFT_CLIENT_ID'),
        client_secret: this.twentyConfigService.get(
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

    z.object({
      access_token: z.string(),
      refresh_token: z.string(),
    }).parse(response.data);

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
    };
  }
}
