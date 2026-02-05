import { Injectable } from '@nestjs/common';

import { type Client } from '@microsoft/microsoft-graph-client';
import { type gmail_v1, google } from 'googleapis';
import MailComposer from 'nodemailer/lib/mail-composer';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { ImapFindDraftsFolderService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-find-drafts-folder.service';
import { SmtpClientProvider } from 'src/modules/messaging/message-import-manager/drivers/smtp/providers/smtp-client.provider';
import { mimeEncode } from 'src/modules/messaging/message-import-manager/utils/mime-encode.util';
import { toMicrosoftRecipients } from 'src/modules/messaging/message-import-manager/utils/to-microsoft-recipients.util';

type EmailAddress = string | string[];

type SendMessageInput = {
  body: string;
  subject: string;
  to: EmailAddress;
  cc?: EmailAddress;
  bcc?: EmailAddress;
  html: string;
  attachments?: {
    filename: string;
    content: Buffer;
    contentType: string;
  }[];
};

@Injectable()
export class MessagingSendMessageService {
  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
    private readonly smtpClientProvider: SmtpClientProvider,
    private readonly imapClientProvider: ImapClientProvider,
    private readonly imapFindDraftsFolderService: ImapFindDraftsFolderService,
  ) {}

  public async sendMessage(
    sendMessageInput: SendMessageInput,
    connectedAccount: ConnectedAccountWorkspaceEntity,
  ): Promise<void> {
    switch (connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE: {
        const { gmailClient, encodedMessage } = await this.composeGmailMessage(
          connectedAccount,
          sendMessageInput,
        );

        await gmailClient.users.messages.send({
          userId: 'me',
          requestBody: {
            raw: encodedMessage,
          },
        });
        break;
      }
      case ConnectedAccountProvider.MICROSOFT: {
        const { microsoftClient, message } = await this.composeMicrosoftMessage(
          connectedAccount,
          sendMessageInput,
        );

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

        this.assertHandleIsDefined(handle);

        const messageBuffer = await this.compileRawMessage(
          handle,
          sendMessageInput,
        );

        await smtpClient.sendMail({
          from: handle,
          to: sendMessageInput.to,
          cc: sendMessageInput.cc,
          bcc: sendMessageInput.bcc,
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

  public async createDraft(
    sendMessageInput: SendMessageInput,
    connectedAccount: ConnectedAccountWorkspaceEntity,
  ): Promise<void> {
    switch (connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE: {
        const { gmailClient, encodedMessage } = await this.composeGmailMessage(
          connectedAccount,
          sendMessageInput,
        );

        await gmailClient.users.drafts.create({
          userId: 'me',
          requestBody: {
            message: {
              raw: encodedMessage,
            },
          },
        });
        break;
      }
      case ConnectedAccountProvider.MICROSOFT: {
        const { microsoftClient, message } = await this.composeMicrosoftMessage(
          connectedAccount,
          sendMessageInput,
        );

        await microsoftClient.api(`/me/messages`).post(message);

        break;
      }
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV: {
        const { handle, connectionParameters } = connectedAccount;

        this.assertHandleIsDefined(handle);

        if (!isDefined(connectionParameters?.IMAP)) {
          throw new Error('IMAP connection is required to create drafts');
        }

        const messageBuffer = await this.compileRawMessage(
          handle,
          sendMessageInput,
        );

        const imapClient =
          await this.imapClientProvider.getClient(connectedAccount);

        try {
          const draftsFolder =
            await this.imapFindDraftsFolderService.findOrCreateDraftsFolder(
              imapClient,
            );

          if (!isDefined(draftsFolder)) {
            throw new Error('No drafts folder found and could not create one');
          }
          const DRAFT_FLAG = '\\Draft';

          await imapClient.append(draftsFolder.path, messageBuffer, [
            DRAFT_FLAG,
          ]);
        } finally {
          await this.imapClientProvider.closeClient(imapClient);
        }

        break;
      }
      default:
        assertUnreachable(
          connectedAccount.provider,
          `Provider ${connectedAccount.provider} not supported for creating drafts`,
        );
    }
  }

  private toMailComposerOptions(
    from: string,
    sendMessageInput: SendMessageInput,
  ) {
    return {
      from,
      to: sendMessageInput.to,
      cc: sendMessageInput.cc,
      bcc: sendMessageInput.bcc,
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
    };
  }

  private async composeGmailMessage(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    sendMessageInput: SendMessageInput,
  ): Promise<{
    gmailClient: gmail_v1.Gmail;
    encodedMessage: string;
  }> {
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

    const from = isDefined(fromName)
      ? `"${mimeEncode(fromName)}" <${fromEmail}>`
      : `${fromEmail}`;

    const mail = new MailComposer(
      this.toMailComposerOptions(from, sendMessageInput),
    );

    const compiledMessage = mail.compile();

    compiledMessage.keepBcc = true;

    const messageBuffer = await compiledMessage.build();
    const encodedMessage = Buffer.from(messageBuffer).toString('base64');

    return { gmailClient, encodedMessage };
  }

  private async composeMicrosoftMessage(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    sendMessageInput: SendMessageInput,
  ): Promise<{
    microsoftClient: Client;
    message: Record<string, unknown>;
  }> {
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
      toRecipients: toMicrosoftRecipients(sendMessageInput.to),
      ccRecipients: toMicrosoftRecipients(sendMessageInput.cc),
      bccRecipients: toMicrosoftRecipients(sendMessageInput.bcc),
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

    return { microsoftClient, message };
  }

  private async compileRawMessage(
    from: string,
    sendMessageInput: SendMessageInput,
  ): Promise<Buffer> {
    const mail = new MailComposer(
      this.toMailComposerOptions(from, sendMessageInput),
    );

    return mail.compile().build();
  }

  private assertHandleIsDefined(
    handle: string | null,
  ): asserts handle is string {
    if (!isDefined(handle)) {
      throw new Error('Handle is required');
    }
  }
}
