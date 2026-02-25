import { Injectable } from '@nestjs/common';

import { google } from 'googleapis';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { getHtmlBodyData } from 'src/modules/messaging/message-html-preview/drivers/gmail/utils/get-html-body-data.util';

@Injectable()
export class GmailHtmlPreviewService {
  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
  ) {}

  async getMessageHtml(
    messageExternalId: string,
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken'
    >,
  ): Promise<string | null> {
    const oAuth2Client =
      await this.oAuth2ClientManagerService.getGoogleOAuth2Client(
        connectedAccount,
      );

    const gmailClient = google.gmail({
      version: 'v1',
      auth: oAuth2Client,
    });

    const response = await gmailClient.users.messages.get({
      userId: 'me',
      id: messageExternalId,
    });

    const htmlData = getHtmlBodyData(response.data);

    if (!htmlData) {
      return null;
    }

    return Buffer.from(htmlData, 'base64').toString('utf-8');
  }
}
