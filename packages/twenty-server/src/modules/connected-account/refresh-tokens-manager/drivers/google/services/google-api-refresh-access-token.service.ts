import { Injectable } from '@nestjs/common';

import axios from 'axios';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { NewTokens } from 'src/modules/connected-account/refresh-tokens-manager/services/refresh-tokens.service';

interface GoogleRefreshTokenResponse {
  access_token: string;
  id_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
}
@Injectable()
export class GoogleAPIRefreshAccessTokenService {
  constructor(private readonly environmentService: EnvironmentService) {}

  async refreshAccessToken(refreshToken: string): Promise<NewTokens> {
    const response = await axios.post<GoogleRefreshTokenResponse>(
      'https://oauth2.googleapis.com/token',
      {
        client_id: this.environmentService.get('AUTH_GOOGLE_CLIENT_ID'),
        client_secret: this.environmentService.get('AUTH_GOOGLE_CLIENT_SECRET'),
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return {
      newAccessToken: response.data.access_token,
    };
  }
}
