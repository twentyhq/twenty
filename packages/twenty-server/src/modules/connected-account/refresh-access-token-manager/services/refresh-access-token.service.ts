import { Injectable } from '@nestjs/common';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/refresh-access-token-manager/drivers/google/services/google-api-refresh-access-token.service';
import {
  RefreshAccessTokenError,
  RefreshAccessTokenErrorCode,
} from 'src/modules/connected-account/refresh-access-token-manager/types/refresh-access-token-error.type';
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
      throw {
        code: RefreshAccessTokenErrorCode.REFRESH_TOKEN_NOT_FOUND,
        message: `No refresh token found for connected account ${connectedAccount.id} in workspace ${workspaceId}`,
      } satisfies RefreshAccessTokenError;
    }

    const accessToken = await this.refreshAccessToken(
      connectedAccount,
      refreshToken,
    ).catch((error) => {
      throw {
        code: RefreshAccessTokenErrorCode.REFRESH_ACCESS_TOKEN_FAILED,
        message: `Failed to refresh access token for connected account ${connectedAccount.id} in workspace ${workspaceId}: ${error.message}`,
      } satisfies RefreshAccessTokenError;
    });

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
        throw {
          code: RefreshAccessTokenErrorCode.PROVIDER_NOT_SUPPORTED,
          message: `Provider ${connectedAccount.provider} is not supported.`,
        } satisfies RefreshAccessTokenError;
    }
  }
}
