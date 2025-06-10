import { Injectable } from '@nestjs/common';

import axios from 'axios';
import { z } from 'zod';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export type GoogleTokens = {
  accessToken: string;
};

interface GoogleRefreshTokenResponse {
  access_token: string;
  id_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
}
@Injectable()
export class GoogleAPIRefreshAccessTokenService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  async refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
    const response = await axios.post<GoogleRefreshTokenResponse>(
      'https://oauth2.googleapis.com/token',
      {
        client_id: this.twentyConfigService.get('AUTH_GOOGLE_CLIENT_ID'),
        client_secret: this.twentyConfigService.get(
          'AUTH_GOOGLE_CLIENT_SECRET',
        ),
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    z.string().parse(response.data.access_token);

    return {
      accessToken: response.data.access_token,
    };
  }
}
