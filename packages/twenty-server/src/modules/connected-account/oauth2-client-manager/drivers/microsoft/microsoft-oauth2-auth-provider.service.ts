import { Injectable, Logger } from '@nestjs/common';

import { AuthProviderCallback } from '@microsoft/microsoft-graph-client';

import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { ConnectedAccountRefreshAccessTokenExceptionCode } from 'src/modules/connected-account/refresh-tokens-manager/exceptions/connected-account-refresh-tokens.exception';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class MicrosoftOAuth2AuthProviderService {
  private readonly logger = new Logger(MicrosoftOAuth2AuthProviderService.name);
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

  public createAuthProvider(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'refreshToken' | 'accessToken' | 'id'
    >,
  ) {
    return async (done: AuthProviderCallback) => {
      await this.getAuthProvider(connectedAccount, done);
    };
  }

  private async getAuthProvider(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'refreshToken' | 'accessToken' | 'id'
    >,
    callback: AuthProviderCallback,
  ): Promise<void> {
    const accessTokenNeedsRefresh = this.jwtWrapperService.isTokenExpired(
      connectedAccount.accessToken,
    );

    if (!accessTokenNeedsRefresh) {
      callback(null, connectedAccount.accessToken);

      return;
    }

    const newAccessToken = await this.getAccessTokenByRefreshToken(
      connectedAccount.refreshToken,
    );

    const connectedAccountRepository =
      await this.twentyORMManager.getRepository<ConnectedAccountWorkspaceEntity>(
        'connectedAccount',
      );

    await connectedAccountRepository.update(
      { id: connectedAccount.id },
      { accessToken: newAccessToken },
    );

    return callback(null, newAccessToken);
  }

  private getAccessTokenByRefreshToken = async (refreshToken: string) => {
    const urlData = new URLSearchParams();

    urlData.append(
      'client_id',
      this.twentyConfigService.get('AUTH_MICROSOFT_CLIENT_ID'),
    );
    urlData.append('scope', 'https://graph.microsoft.com/.default');
    urlData.append('refresh_token', refreshToken);
    urlData.append(
      'client_secret',
      this.twentyConfigService.get('AUTH_MICROSOFT_CLIENT_SECRET'),
    );
    urlData.append('grant_type', 'refresh_token');

    const res = await fetch(
      `https://login.microsoftonline.com/common/oauth2/v2.0/token`,
      {
        method: 'POST',
        body: urlData,
      },
    );

    const data = await res.json();

    if (!res.ok) {
      if (data) {
        const accessTokenSliced = data?.access_token?.slice(0, 10);
        const refreshTokenSliced = data?.refresh_token?.slice(0, 10);

        delete data.access_token;
        delete data.refresh_token;
        this.logger.error(data);
        this.logger.error(`accessTokenSliced: ${accessTokenSliced}`);
        this.logger.error(`refreshTokenSliced: ${refreshTokenSliced}`);
      }

      this.logger.error(res);
      throw new Error(
        `${MicrosoftOAuth2AuthProviderService.name} error: ${ConnectedAccountRefreshAccessTokenExceptionCode.REFRESH_ACCESS_TOKEN_FAILED}`,
      );
    }

    return data.access_token;
  };
}
