import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type gmail_v1, google } from 'googleapis';
import MailComposer from 'nodemailer/lib/mail-composer';
import { isDefined } from 'twenty-shared/utils';

import { type MessageOutboundDriver } from 'src/modules/messaging/message-outbound-manager/interfaces/message-outbound-driver.interface';

import { GoogleOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client.provider';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type SendMessageInput } from 'src/modules/messaging/message-outbound-manager/types/send-message-input.type';
import { type SendMessageResult } from 'src/modules/messaging/message-outbound-manager/types/send-message-result.type';
import { extractMessageIdFromBuffer } from 'src/modules/messaging/message-outbound-manager/utils/extract-message-id-from-buffer.util';
import { formatMessageFromHeader } from 'src/modules/messaging/message-outbound-manager/utils/format-message-from-header.util';
import { toMailComposerOptions } from 'src/modules/messaging/message-outbound-manager/utils/to-mail-composer-options.util';

@Injectable()
export class GmailMessageOutboundService implements MessageOutboundDriver {
  private readonly logger = new Logger(GmailMessageOutboundService.name);

  constructor(
    private readonly googleOAuth2ClientProvider: GoogleOAuth2ClientProvider,
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
        ...(isNonEmptyString(sendMessageInput.threadExternalId)
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
          ...(isNonEmptyString(sendMessageInput.threadExternalId)
            ? { threadId: sendMessageInput.threadExternalId }
            : {}),
        },
      },
    });
  }

  async sendDraft(
    draftExternalId: string,
    sendMessageInput: SendMessageInput,
    connectedAccount: ConnectedAccountEntity,
  ): Promise<SendMessageResult> {
    const sendResult = await this.sendMessage(
      sendMessageInput,
      connectedAccount,
    );

    try {
      await this.deleteDraftByMessageId(connectedAccount, draftExternalId);
    } catch (error) {
      this.logger.warn(
        `Failed to delete Gmail draft for message ${draftExternalId} after send: ${error}`,
      );
    }

    return sendResult;
  }

  private async deleteDraftByMessageId(
    connectedAccount: ConnectedAccountEntity,
    messageId: string,
  ): Promise<void> {
    const oAuth2Client = await this.googleOAuth2ClientProvider.getClient(
      connectedAccount.id,
    );

    const gmailClient = google.gmail({ version: 'v1', auth: oAuth2Client });

    const draftId = await this.findDraftIdByMessageId(gmailClient, messageId);

    if (isDefined(draftId)) {
      await gmailClient.users.drafts.delete({ userId: 'me', id: draftId });

      return;
    }

    this.logger.warn(
      `No Gmail draft found for message ${messageId}; skipping delete`,
    );
  }

  private async findDraftIdByMessageId(
    gmailClient: gmail_v1.Gmail,
    messageId: string,
  ): Promise<string | undefined> {
    let pageToken: string | undefined = undefined;

    do {
      const { data }: { data: gmail_v1.Schema$ListDraftsResponse } =
        await gmailClient.users.drafts.list({
          userId: 'me',
          maxResults: 500,
          pageToken,
        });

      const draft = (data.drafts ?? []).find(
        (currentDraft) => currentDraft.message?.id === messageId,
      );

      if (isDefined(draft?.id)) {
        return draft.id;
      }

      pageToken = data.nextPageToken ?? undefined;
    } while (isDefined(pageToken));

    return undefined;
  }

  private async composeGmailMessage(
    connectedAccount: ConnectedAccountEntity,
    sendMessageInput: SendMessageInput,
  ): Promise<{
    gmailClient: gmail_v1.Gmail;
    encodedMessage: string;
    messageBuffer: Buffer;
  }> {
    const oAuth2Client = await this.googleOAuth2ClientProvider.getClient(
      connectedAccount.id,
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

    if (!isNonEmptyString(fromEmail)) {
      throw new Error('Gmail profile did not return an email address');
    }

    const { data: peopleData } = await peopleClient.people.get({
      resourceName: 'people/me',
      personFields: 'names',
    });

    const fromName = peopleData?.names?.[0]?.displayName;

    const from = formatMessageFromHeader({
      fromEmail,
      fromName,
    });

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
