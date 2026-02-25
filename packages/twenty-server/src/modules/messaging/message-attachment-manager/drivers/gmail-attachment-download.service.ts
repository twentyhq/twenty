import { Injectable } from '@nestjs/common';

import { google } from 'googleapis';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class GmailAttachmentDownloadService {
  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
  ) {}

  async download(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken'
    >,
    externalMessageId: string,
    externalIdentifier: string,
  ): Promise<Buffer> {
    const oAuth2Client =
      await this.oAuth2ClientManagerService.getGoogleOAuth2Client(
        connectedAccount,
      );

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const response = await gmail.users.messages.attachments.get({
      userId: 'me',
      messageId: externalMessageId,
      id: externalIdentifier,
    });

    if (!response.data.data) {
      throw new Error('Attachment data not found');
    }

    return Buffer.from(response.data.data, 'base64url');
  }
}
