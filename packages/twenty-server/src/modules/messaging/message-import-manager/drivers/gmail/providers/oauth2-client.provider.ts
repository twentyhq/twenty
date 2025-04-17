import { Injectable } from '@nestjs/common';

import { oauth2_v2, google } from 'googleapis';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class OAuth2ClientProvider {
  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
  ) {}

  public async getOAuth2Client(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken'
    >,
  ): Promise<oauth2_v2.Oauth2> {
    const oAuth2Client =
      await this.oAuth2ClientManagerService.getOAuth2Client(connectedAccount);

    return google.oauth2({
      version: 'v2',
      auth: oAuth2Client,
    });
  }
}
