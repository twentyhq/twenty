import { Injectable } from '@nestjs/common';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/refresh-access-token-manager/drivers/google/services/google-api-refresh-access-token.service';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class RefreshAccessTokenService {
  constructor(
    private readonly googleAPIRefreshAccessTokenService: GoogleAPIRefreshAccessTokenService,
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
  ) {}

  async refreshAndSaveAccessToken(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ): Promise<string> {
    const refreshToken = connectedAccount.refreshToken;

    if (!refreshToken) {
      throw new Error(
        `No refresh token found for connected account ${connectedAccount.id} in workspace ${workspaceId}`,
      );
    }
    const accessToken = await this.refreshAccessToken(
      connectedAccount,
      refreshToken,
    );

    await this.connectedAccountRepository.updateAccessToken(
      accessToken,
      connectedAccount.id,
      workspaceId,
    );

    await this.connectedAccountRepository.updateAccessToken(
      accessToken,
      connectedAccount.id,
      workspaceId,
    );

    return accessToken;
  }

  async refreshAccessToken(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    refreshToken: string,
  ): Promise<string> {
    switch (connectedAccount.provider) {
      case 'google':
        return this.googleAPIRefreshAccessTokenService.refreshAccessToken(
          refreshToken,
        );
      default:
        throw new Error(
          `Provider ${connectedAccount.provider} is not supported.`,
        );
    }
  }
}
