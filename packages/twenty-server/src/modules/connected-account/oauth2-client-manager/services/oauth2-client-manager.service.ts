import { Injectable } from '@nestjs/common';

import { OAuth2Client } from 'google-auth-library';

import { GoogleOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client-manager.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class OAuth2ClientManagerService {
  constructor(
    private readonly googleOAuth2ClientManagerService: GoogleOAuth2ClientManagerService,
  ) {}

  public async getOAuth2Client(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken'
    >,
  ): Promise<OAuth2Client> {
    const { refreshToken } = connectedAccount;

    switch (connectedAccount.provider) {
      case 'google':
        return this.googleOAuth2ClientManagerService.getOAuth2Client(
          refreshToken,
        );
      default:
        throw new Error(
          `OAuth2 client manager for provider ${connectedAccount.provider} is not implemented`,
        );
    }
  }
}
