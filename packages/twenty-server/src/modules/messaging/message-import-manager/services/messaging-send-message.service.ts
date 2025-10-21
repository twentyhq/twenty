import { Injectable } from '@nestjs/common';

import MailComposer from 'nodemailer/lib/mail-composer';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
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
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
    private readonly smtpClientProvider: SmtpClientProvider,
    private readonly imapClientProvider: ImapClientProvider,
  ) {}

  public async sendMessage(
    sendMessageInput: SendMessageInput,
    connectedAccount: ConnectedAccountWorkspaceEntity,
  ): Promise<void> {
    switch (connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE: {
        const oAuth2Client =
          await this.oAuth2ClientManagerService.getGoogleOAuth2Client(
            connectedAccount,
          );

        const gmailClient = oAuth2Client.gmail({
          version: 'v1',
        });

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
          `To: ${sendMessageInput.to}`,
          `Subject: ${mimeEncode(sendMessageInput.subject)}`,
          'MIME-Version: 1.0',
          `Content-Type: multipart/alternative; boundary="${boundary}"`,
          '',
          `--${boundary}`,
          'Content-Type: text/plain; charset="UTF-8"',
          '',
          sendMessageInput.body,
          '',
          `--${boundary}`,
          'Content-Type: text/html; charset="UTF-8"',
          '',
          sendMessageInput.html,
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
          await this.oAuth2ClientManagerService.getMicrosoftOAuth2Client(
            connectedAccount,
          );

        const message = {
          subject: sendMessageInput.subject,
          body: {
            contentType: 'HTML',
            content: sendMessageInput.html,
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
        const { handle, connectionParameters, messageChannels } =
          connectedAccount;

        const smtpClient =
          await this.smtpClientProvider.getSmtpClient(connectedAccount);

        const mail = new MailComposer({
          from: handle,
          to: sendMessageInput.to,
          subject: sendMessageInput.subject,
          text: sendMessageInput.body,
          html: sendMessageInput.html,
        });

        const messageBuffer = await mail.compile().build();

        await smtpClient.sendMail({
          from: handle,
          to: sendMessageInput.to,
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
          connectedAccount.provider,
          `Provider ${connectedAccount.provider} not supported for sending messages`,
        );
    }
  }
}
