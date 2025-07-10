import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { GmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/gmail-client.provider';
import { OAuth2ClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/oauth2-client.provider';
import { MicrosoftClientProvider } from 'src/modules/messaging/message-import-manager/drivers/microsoft/providers/microsoft-client.provider';
import { SmtpClientProvider } from 'src/modules/messaging/message-import-manager/drivers/smtp/providers/smtp-client.provider';
import { isAccessTokenRefreshingError } from 'src/modules/messaging/message-import-manager/drivers/microsoft/utils/is-access-token-refreshing-error.utils';
import { mimeEncode } from 'src/modules/messaging/message-import-manager/utils/mime-encode.util';

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
    private readonly smtpClientProvider: SmtpClientProvider,
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

        const headers: string[] = [];

        if (isDefined(fromName)) {
          headers.push(`From: "${mimeEncode(fromName)}" <${fromEmail}>`);
        }

        headers.push(
          `To: ${sendMessageInput.to}`,
          `Subject: ${mimeEncode(sendMessageInput.subject)}`,
          'MIME-Version: 1.0',
          'Content-Type: text/plain; charset="UTF-8"',
          '',
          sendMessageInput.body,
        );

        const message = headers.join('\n');

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
          .post(message)
          .catch((error) => {
            if (isAccessTokenRefreshingError(error?.body)) {
              throw new MessageImportDriverException(
                error.message,
                MessageImportDriverExceptionCode.CLIENT_NOT_AVAILABLE,
              );
            }
            throw error;
          });

        z.string().parse(response.id);

        await microsoftClient
          .api(`/me/messages/${response.id}/send`)
          .post({})
          .catch((error) => {
            if (isAccessTokenRefreshingError(error?.body)) {
              throw new MessageImportDriverException(
                error.message,
                MessageImportDriverExceptionCode.CLIENT_NOT_AVAILABLE,
              );
            }
            throw error;
          });

        break;
      }
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV: {
        const smtpClient =
          await this.smtpClientProvider.getSmtpClient(connectedAccount);

        await smtpClient.sendMail({
          from: connectedAccount.handle,
          to: sendMessageInput.to,
          subject: sendMessageInput.subject,
          text: sendMessageInput.body,
        });
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
