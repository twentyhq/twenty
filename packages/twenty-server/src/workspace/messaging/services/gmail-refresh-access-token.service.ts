import { Injectable } from '@nestjs/common';

import axios from 'axios';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { ConnectedAccountService } from 'src/workspace/messaging/repositories/connected-account/connected-account.service';

@Injectable()
export class GmailRefreshAccessTokenService {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly connectedAccountService: ConnectedAccountService,
  ) {}

  async refreshAndSaveAccessToken(
    workspaceId: string,
    connectedAccountId: string,
  ): Promise<void> {
    const connectedAccount = await this.connectedAccountService.getByIdOrFail(
      connectedAccountId,
      workspaceId,
    );

    const refreshToken = connectedAccount.refreshToken;

    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    const accessToken = await this.refreshAccessToken(refreshToken);

    await this.connectedAccountService.updateAccessToken(
      accessToken,
      connectedAccountId,
      workspaceId,
    );
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const response = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        client_id: this.environmentService.getAuthGoogleClientId(),
        client_secret: this.environmentService.getAuthGoogleClientSecret(),
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.access_token;
  }
}
