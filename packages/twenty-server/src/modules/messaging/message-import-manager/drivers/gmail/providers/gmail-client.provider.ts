import { Injectable } from '@nestjs/common';

import { gmail_v1, google } from 'googleapis';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class GmailClientProvider {
  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
  ) {}

  public async getGmailClient(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken'
    >,
  ): Promise<gmail_v1.Gmail> {
    const oAuth2Client =
      await this.oAuth2ClientManagerService.getOAuth2Client(connectedAccount);

    const gmailClient = google.gmail({
      version: 'v1',
      auth: oAuth2Client,
    });

    return gmailClient;
  }
}
