import { Injectable } from '@nestjs/common';

import { assertUnreachable, ConnectedAccountProvider } from 'twenty-shared';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { GmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/gmail-client.provider';

interface SendMessageInput {
  body: string;
  subject: string;
  to: string;
}

@Injectable()
export class MessagingSendMessageService {
  constructor(private readonly gmailClientProvider: GmailClientProvider) {}

  public async sendMessage(
    sendMessageInput: SendMessageInput,
    connectedAccount: ConnectedAccountWorkspaceEntity,
  ): Promise<void> {
    switch (connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE: {
        const gmailClient =
          await this.gmailClientProvider.getGmailClient(connectedAccount);

        const message = [
          `To: ${sendMessageInput.to}`,
          `Subject: ${sendMessageInput.subject}`,
          'MIME-Version: 1.0',
          'Content-Type: text/plain; charset="UTF-8"',
          '',
          sendMessageInput.body,
        ].join('\n');

        const encodedMessage = Buffer.from(message).toString('base64');

        await gmailClient.users.messages.send({
          userId: 'me',
          requestBody: {
            raw: encodedMessage,
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
