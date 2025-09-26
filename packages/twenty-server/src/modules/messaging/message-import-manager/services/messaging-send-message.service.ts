import { Injectable } from '@nestjs/common';

import MailComposer from 'nodemailer/lib/mail-composer';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { GmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/gmail-client.provider';
import { OAuth2ClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/oauth2-client.provider';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { MicrosoftClientProvider } from 'src/modules/messaging/message-import-manager/drivers/microsoft/providers/microsoft-client.provider';
import { isAccessTokenRefreshingError } from 'src/modules/messaging/message-import-manager/drivers/microsoft/utils/is-access-token-refreshing-error.utils';
import { SmtpClientProvider } from 'src/modules/messaging/message-import-manager/drivers/smtp/providers/smtp-client.provider';
import { mimeEncode } from 'src/modules/messaging/message-import-manager/utils/mime-encode.util';

interface SendMessageInput {
  body: string;
  subject: string;
  to: string;
  html: string;
}

@Injectable()
export class MessagingSendMessageService {
  constructor(
    private readonly gmailClientProvider: GmailClientProvider,
    private readonly oAuth2ClientProvider: OAuth2ClientProvider,
    private readonly microsoftClientProvider: MicrosoftClientProvider,
    private readonly smtpClientProvider: SmtpClientProvider,
    private readonly imapClientProvider: ImapClientProvider,
  ) {}

  public async sendMessage(
    sendMessageInput: SendMessageInput,
    connectedAccount: ConnectedAccountWorkspaceEntity,
  ): Promise<void> {
    const { handle, connectionParameters, messageChannels, provider } =
      connectedAccount;

    const { to, subject, body, html } = sendMessageInput;

    switch (provider) {
      case ConnectedAccountProvider.GOOGLE: {
        const gmailClient =
          await this.gmailClientProvider.getGmailClient(connectedAccount);

        const oAuth2Client =
          await this.oAuth2ClientProvider.getOAuth2Client(connectedAccount);

        const { data } = await oAuth2Client.userinfo.get();

        const fromEmail = data.email;
        const fromName = data.name;
        const boundary = `boundary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const headers: string[] = [];

        if (isDefined(fromName)) {
          headers.push(`From: "${mimeEncode(fromName)}" <${fromEmail}>`);
        } else {
          headers.push(`From: ${fromEmail}`);
        }

        headers.push(
          `To: ${to}`,
          `Subject: ${mimeEncode(subject)}`,
          'MIME-Version: 1.0',
          `Content-Type: multipart/alternative; boundary="${boundary}"`,
          '',
          `--${boundary}`,
          'Content-Type: text/plain; charset="UTF-8"',
          '',
          body,
          '',
          `--${boundary}`,
          'Content-Type: text/html; charset="UTF-8"',
          '',
          html,
          '',
          `--${boundary}--`,
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
          subject: subject,
          body: {
            contentType: 'HTML',
            content: html,
          },
          toRecipients: [{ emailAddress: { address: to } }],
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

        const mail = new MailComposer({
          from: handle,
          to,
          subject,
          text: body,
          html,
        });

        const messageBuffer = await mail.compile().build();

        await smtpClient.sendMail({
          from: handle,
          to,
          raw: messageBuffer,
        });

        if (isDefined(connectionParameters?.IMAP)) {
          const imapClient =
            await this.imapClientProvider.getClient(connectedAccount);

          const messageChannel = messageChannels.find(
            (channel) => channel.handle === handle,
          );

          const sentFolder = messageChannel?.messageFolders.find(
            (messageFolder) => messageFolder.isSentFolder,
          );

          if (isDefined(sentFolder)) {
            await imapClient.append(sentFolder.name, messageBuffer);
          }

          await this.imapClientProvider.closeClient(imapClient);
        }

        break;
      }
      default:
        assertUnreachable(
          provider,
          `Provider ${provider} not supported for sending messages`,
        );
    }
  }
}
