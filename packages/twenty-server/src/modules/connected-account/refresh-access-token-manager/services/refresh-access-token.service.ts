import { Injectable } from '@nestjs/common';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/refresh-access-token-manager/drivers/google/services/google-api-refresh-access-token.service';
import {
  RefreshAccessTokenException,
  RefreshAccessTokenExceptionCode,
} from 'src/modules/connected-account/refresh-access-token-manager/exceptions/refresh-access-token.exception';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class RefreshAccessTokenService {
  constructor(
    private readonly googleAPIRefreshAccessTokenService: GoogleAPIRefreshAccessTokenService,
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

  async refreshAndSaveAccessToken(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ): Promise<string> {
    const refreshToken = connectedAccount.refreshToken;

    if (!refreshToken) {
      throw new RefreshAccessTokenException(
        `No refresh token found for connected account ${connectedAccount.id} in workspace ${workspaceId}`,
        RefreshAccessTokenExceptionCode.REFRESH_TOKEN_NOT_FOUND,
      );
    }

    let accessToken: string;

    try {
      accessToken = await this.refreshAccessToken(
        connectedAccount,
        refreshToken,
      );
    } catch (error) {
      throw new RefreshAccessTokenException(
        `Error refreshing access token for connected account ${connectedAccount.id} in workspace ${workspaceId}: ${error.message}`,
        RefreshAccessTokenExceptionCode.REFRESH_ACCESS_TOKEN_FAILED,
      );
    }

    const connectedAccountRepository =
      await this.twentyORMManager.getRepository<ConnectedAccountWorkspaceEntity>(
        'connectedAccount',
      );

    await connectedAccountRepository.update(
      { id: connectedAccount.id },
      {
        accessToken,
      },
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
        throw new RefreshAccessTokenException(
          `Provider ${connectedAccount.provider} is not supported`,
          RefreshAccessTokenExceptionCode.PROVIDER_NOT_SUPPORTED,
        );
    }
  }
}
