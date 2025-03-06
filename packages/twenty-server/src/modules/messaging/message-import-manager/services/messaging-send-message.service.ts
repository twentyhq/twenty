import { Injectable } from '@nestjs/common';

import { assertUnreachable, ConnectedAccountProvider } from 'twenty-shared';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { GmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/gmail-client.provider';

interface SendMessageInput {
  body: string;
}

@Injectable()
export class MessagingSendMessageService {
  constructor(private readonly gmailClientProvider: GmailClientProvider) {}

  public async sendMessage(
    sendMessageInput: SendMessageInput,
    connectedAccount: ConnectedAccountWorkspaceEntity,
  ): Promise<void> {
    const gmailClient =
      await this.gmailClientProvider.getGmailClient(connectedAccount);

    switch (connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE: {
        await gmailClient.users.messages.send({
          userId: 'me',
          requestBody: {
            raw: sendMessageInput.body,
          },
        });
        break;
      }
      case ConnectedAccountProvider.MICROSOFT:
        // TODO: Implement Microsoft provider
        throw new Error('Microsoft provider not implemented');
      default:
        assertUnreachable(
          connectedAccount.provider,
          `Provider ${connectedAccount.provider} not supported for sending messages`,
        );
    }
  }
}
