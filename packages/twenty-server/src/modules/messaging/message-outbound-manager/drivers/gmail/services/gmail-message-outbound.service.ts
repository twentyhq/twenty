import { Injectable } from '@nestjs/common';

import { type gmail_v1, google } from 'googleapis';
import MailComposer from 'nodemailer/lib/mail-composer';
import { isDefined } from 'twenty-shared/utils';

import { type MessageOutboundDriver } from 'src/modules/messaging/message-outbound-manager/interfaces/message-outbound-driver.interface';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { mimeEncode } from 'src/modules/messaging/message-import-manager/utils/mime-encode.util';
import { type SendMessageInput } from 'src/modules/messaging/message-outbound-manager/types/send-message-input.type';
import { toMailComposerOptions } from 'src/modules/messaging/message-outbound-manager/utils/to-mail-composer-options.util';

@Injectable()
export class GmailMessageOutboundService implements MessageOutboundDriver {
  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
  ) {}

  async sendMessage(
    sendMessageInput: SendMessageInput,
    connectedAccount: ConnectedAccountWorkspaceEntity,
  ): Promise<void> {
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
  }

  async createDraft(
    sendMessageInput: SendMessageInput,
    connectedAccount: ConnectedAccountWorkspaceEntity,
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
      toMailComposerOptions(from, sendMessageInput),
    );

    const compiledMessage = mail.compile();

    compiledMessage.keepBcc = true;

    const messageBuffer = await compiledMessage.build();
    const encodedMessage = Buffer.from(messageBuffer).toString('base64url');

    return { gmailClient, encodedMessage };
  }
}
