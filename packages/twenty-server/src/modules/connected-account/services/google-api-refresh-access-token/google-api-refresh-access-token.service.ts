import { Injectable } from '@nestjs/common';

import axios from 'axios';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';

@Injectable()
export class GoogleAPIRefreshAccessTokenService {
  constructor(
    private readonly environmentService: EnvironmentService,
    @InjectObjectMetadataRepository(ConnectedAccountObjectMetadata)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
  ) {}

  async refreshAndSaveAccessToken(
    workspaceId: string,
    connectedAccountId: string,
  ): Promise<void> {
    const connectedAccount = await this.connectedAccountRepository.getById(
      connectedAccountId,
      workspaceId,
    );

    if (!connectedAccount) {
      throw new Error(
        `No connected account found for ${connectedAccountId} in workspace ${workspaceId}`,
      );
    }

    const refreshToken = connectedAccount.refreshToken;

    if (!refreshToken) {
      throw new Error(
        `No refresh token found for connected account ${connectedAccountId} in workspace ${workspaceId}`,
      );
    }

    const accessToken = await this.refreshAccessToken(
      refreshToken,
      connectedAccountId,
      workspaceId,
    );

    await this.connectedAccountRepository.updateAccessToken(
      accessToken,
      connectedAccountId,
      workspaceId,
    );
  }

  async refreshAccessToken(
    refreshToken: string,
    connectedAccountId: string,
    workspaceId: string,
  ): Promise<string> {
    try {
      const response = await axios.post(
        'https://oauth2.googleapis.com/token',
        {
          client_id: this.environmentService.get('AUTH_GOOGLE_CLIENT_ID'),
          client_secret: this.environmentService.get(
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

      return response.data.access_token;
    } catch (error) {
      await this.connectedAccountRepository.updateAuthFailedAt(
        connectedAccountId,
        workspaceId,
      );
      throw new Error(`Error refreshing access token: ${error.message}`);
    }
  }
}
