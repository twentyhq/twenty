import { Injectable } from '@nestjs/common';

import { google } from 'googleapis';
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
import { SmtpClientProvider } from 'src/modules/messaging/message-import-manager/drivers/smtp/providers/smtp-client.provider';
import { mimeEncode } from 'src/modules/messaging/message-import-manager/utils/mime-encode.util';

interface SendMessageInput {
  body: string;
  subject: string;
  to: string;
  html: string;
  attachments?: {
    filename: string;
    content: Buffer;
    contentType: string;
  }[];
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

        const gmailClient = google.gmail({
          version: 'v1',
          auth: oAuth2Client,
        });

        const peopleClient = google.people({
          version: 'v1',
          auth: oAuth2Client,
        });

        const { data: gmailData } = await gmailClient.users.getProfile({
          userId: 'me',
        });

        const fromEmail = gmailData.emailAddress;

        const { data: peopleData } = await peopleClient.people.get({
          resourceName: 'people/me',
          personFields: 'names',
        });

        const fromName = peopleData?.names?.[0]?.displayName;

        const mail = new MailComposer({
          from: isDefined(fromName)
            ? `"${mimeEncode(fromName)}" <${fromEmail}>`
            : `${fromEmail}`,
          to: sendMessageInput.to,
          subject: sendMessageInput.subject,
          text: sendMessageInput.body,
          html: sendMessageInput.html,
          ...(sendMessageInput.attachments &&
          sendMessageInput.attachments.length > 0
            ? {
                attachments: sendMessageInput.attachments.map((attachment) => ({
                  filename: attachment.filename,
                  content: attachment.content,
                  contentType: attachment.contentType,
                })),
              }
            : {}),
        });

        const messageBuffer = await mail.compile().build();
        const encodedMessage = Buffer.from(messageBuffer).toString('base64');

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
          ...(sendMessageInput.attachments &&
          sendMessageInput.attachments.length > 0
            ? {
                attachments: sendMessageInput.attachments.map((attachment) => ({
                  '@odata.type': '#microsoft.graph.fileAttachment',
                  name: attachment.filename,
                  contentType: attachment.contentType,
                  contentBytes: attachment.content.toString('base64'),
                })),
              }
            : {}),
        };

        const response = await microsoftClient
          .api(`/me/messages`)
          .post(message);

        z.string().parse(response.id);

        await microsoftClient.api(`/me/messages/${response.id}/send`).post({});

        break;
      }
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV: {
        const { handle, connectionParameters, messageChannels } =
          connectedAccount;

        const smtpClient =
          await this.smtpClientProvider.getSmtpClient(connectedAccount);

        if (!isDefined(handle)) {
          throw new MessageImportDriverException(
            'Handle is required',
            MessageImportDriverExceptionCode.CHANNEL_MISCONFIGURED,
          );
        }

        const mail = new MailComposer({
          from: handle,
          to: sendMessageInput.to,
          subject: sendMessageInput.subject,
          text: sendMessageInput.body,
          html: sendMessageInput.html,
          ...(sendMessageInput.attachments &&
          sendMessageInput.attachments.length > 0
            ? {
                attachments: sendMessageInput.attachments.map((attachment) => ({
                  filename: attachment.filename,
                  content: attachment.content,
                  contentType: attachment.contentType,
                })),
              }
            : {}),
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

          if (isDefined(sentFolder) && isDefined(sentFolder.name)) {
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
