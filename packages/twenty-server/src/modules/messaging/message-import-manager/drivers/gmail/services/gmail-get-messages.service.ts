import { Injectable } from '@nestjs/common';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { GmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/gmail-client.provider';
import { GetMessagesResponse } from 'src/modules/messaging/message-import-manager/services/messaging-get-messages.service';

@Injectable()
export class GmailGetMessagesService {
  constructor(private readonly gmailClientProvider: GmailClientProvider) {}

  public async getMessages(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'id'
    >,
  ): Promise<GetMessagesResponse> {
    const gmailClient =
      await this.gmailClientProvider.getGmailClient(connectedAccount);
  }
}
