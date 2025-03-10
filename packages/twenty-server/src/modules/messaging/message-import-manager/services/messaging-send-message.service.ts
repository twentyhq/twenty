import { Injectable } from '@nestjs/common';

import { assertUnreachable, ConnectedAccountProvider } from 'twenty-shared';
import { z } from 'zod';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { GmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/gmail-client.provider';
import { MicrosoftClientProvider } from 'src/modules/messaging/message-import-manager/drivers/microsoft/providers/microsoft-client.provider';

interface SendMessageInput {
  body: string;
  subject: string;
  to: string;
}

@Injectable()
export class MessagingSendMessageService {
  constructor(
    private readonly gmailClientProvider: GmailClientProvider,
    private readonly microsoftClientProvider: MicrosoftClientProvider,
  ) {}

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
      case ConnectedAccountProvider.MICROSOFT: {
        const microsoftClient =
          await this.microsoftClientProvider.getMicrosoftClient(
            connectedAccount,
          );

        const message = {
          subject: sendMessageInput.subject,
          body: {
            contentType: 'Text',
            content: sendMessageInput.body,
          },
          toRecipients: [{ emailAddress: { address: sendMessageInput.to } }],
        };

        const response = await microsoftClient
          .api(`/me/messages`)
          .post(message);

        z.string().parse(response.id);

        await microsoftClient.api(`/me/messages/${response.id}/send`).post({});
        break;
      }
      default:
        assertUnreachable(
          connectedAccount.provider,
          `Provider ${connectedAccount.provider} not supported for sending messages`,
        );
    }
  }
}
