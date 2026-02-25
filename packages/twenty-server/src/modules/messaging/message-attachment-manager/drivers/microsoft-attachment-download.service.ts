import { Injectable } from '@nestjs/common';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class MicrosoftAttachmentDownloadService {
  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
  ) {}

  async download(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'accessToken'
    >,
    externalMessageId: string,
    externalIdentifier: string,
  ): Promise<Buffer> {
    const client =
      await this.oAuth2ClientManagerService.getMicrosoftOAuth2Client(
        connectedAccount,
      );

    const response = await client
      .api(
        `/me/messages/${externalMessageId}/attachments/${externalIdentifier}`,
      )
      .get();

    if (!response.contentBytes) {
      throw new Error('Attachment content not found');
    }

    return Buffer.from(response.contentBytes, 'base64');
  }
}
