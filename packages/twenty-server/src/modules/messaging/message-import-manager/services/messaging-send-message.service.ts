import { Injectable } from '@nestjs/common';

import { z } from 'zod';
import { assertUnreachable } from 'twenty-shared/utils';
import { ConnectedAccountProvider } from 'twenty-shared/types';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { GmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/gmail-client.provider';
import { MicrosoftClientProvider } from 'src/modules/messaging/message-import-manager/drivers/microsoft/providers/microsoft-client.provider';
import { OAuth2ClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/oauth2-client.provider';

interface SendMessageInput {
  body: string;
  subject: string;
  to: string;
}

@Injectable()
export class MessagingSendMessageService {
  constructor(
    private readonly gmailClientProvider: GmailClientProvider,
    private readonly oAuth2ClientProvider: OAuth2ClientProvider,
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

        const oAuth2Client =
          await this.oAuth2ClientProvider.getOAuth2Client(connectedAccount);

        const { data } = await oAuth2Client.userinfo.get();

        const fromEmail = data.email;

        const fromName = data.name;

        const message = [
          `From: "${fromName}" <${fromEmail}>`,
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
