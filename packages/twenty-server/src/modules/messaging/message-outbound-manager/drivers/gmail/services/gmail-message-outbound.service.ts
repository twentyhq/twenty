import { Injectable } from '@nestjs/common';

import { type gmail_v1, google } from 'googleapis';
import MailComposer from 'nodemailer/lib/mail-composer';
import { isDefined } from 'twenty-shared/utils';

import { type MessageOutboundDriver } from 'src/modules/messaging/message-outbound-manager/interfaces/message-outbound-driver.interface';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { mimeEncode } from 'src/modules/messaging/message-import-manager/utils/mime-encode.util';
import { type SendMessageInput } from 'src/modules/messaging/message-outbound-manager/types/send-message-input.type';
import { type SendMessageResult } from 'src/modules/messaging/message-outbound-manager/types/send-message-result.type';
import { extractMessageIdFromBuffer } from 'src/modules/messaging/message-outbound-manager/utils/extract-message-id-from-buffer.util';
import { toMailComposerOptions } from 'src/modules/messaging/message-outbound-manager/utils/to-mail-composer-options.util';

@Injectable()
export class GmailMessageOutboundService implements MessageOutboundDriver {
  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
  ) {}

  async sendMessage(
    sendMessageInput: SendMessageInput,
    connectedAccount: ConnectedAccountEntity,
  ): Promise<SendMessageResult> {
    const { gmailClient, encodedMessage, messageBuffer } =
      await this.composeGmailMessage(connectedAccount, sendMessageInput);

    const { data } = await gmailClient.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
        ...(sendMessageInput.threadExternalId
          ? { threadId: sendMessageInput.threadExternalId }
          : {}),
      },
    });

    return {
      headerMessageId: extractMessageIdFromBuffer(messageBuffer),
      messageExternalId: data.id ?? undefined,
      threadExternalId: data.threadId ?? undefined,
    };
  }

  async createDraft(
    sendMessageInput: SendMessageInput,
    connectedAccount: ConnectedAccountEntity,
  ): Promise<void> {
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
  }

  private async composeGmailMessage(
    connectedAccount: ConnectedAccountEntity,
    sendMessageInput: SendMessageInput,
  ): Promise<{
    gmailClient: gmail_v1.Gmail;
    encodedMessage: string;
    messageBuffer: Buffer;
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
      toMailComposerOptions(from, sendMessageInput),
    );

    const compiledMessage = mail.compile();

    compiledMessage.keepBcc = true;

    const messageBuffer = await compiledMessage.build();
    const encodedMessage = Buffer.from(messageBuffer).toString('base64url');

    return { gmailClient, encodedMessage, messageBuffer };
  }
}
