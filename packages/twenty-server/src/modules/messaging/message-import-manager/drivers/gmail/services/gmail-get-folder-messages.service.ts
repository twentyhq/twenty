import { Injectable, Logger } from '@nestjs/common';

import { google } from 'googleapis';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { MESSAGING_GMAIL_USERS_MESSAGES_LIST_MAX_RESULT } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-users-messages-list-max-result.constant';
import { GmailMessageListFetchErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-message-list-fetch-error-handler.service';

@Injectable()
export class GmailGetFolderMessagesService {
  private readonly logger = new Logger(GmailGetFolderMessagesService.name);

  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
    private readonly gmailMessageListFetchErrorHandler: GmailMessageListFetchErrorHandler,
  ) {}

  async getMessageIdsFromFolder(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'accessToken' | 'refreshToken' | 'id' | 'handle'
    >,
    messageFolder: Pick<
      MessageFolderWorkspaceEntity,
      'externalId' | 'name' | 'id'
    >,
  ): Promise<string[]> {
    if (!messageFolder.externalId) {
      this.logger.warn(
        `Folder ${messageFolder.id} has no externalId, skipping`,
      );

      return [];
    }

    const oAuth2Client =
      await this.oAuth2ClientManagerService.getGoogleOAuth2Client(
        connectedAccount,
      );

    const gmailClient = google.gmail({
      version: 'v1',
      auth: oAuth2Client,
    });

    let pageToken: string | undefined;
    let hasMoreMessages = true;

    const messageExternalIds: string[] = [];

    this.logger.log(
      `Connected account ${connectedAccount.id}: Fetching messages for label ${messageFolder.externalId}`,
    );

    while (hasMoreMessages) {
      const messageList = await gmailClient.users.messages
        .list({
          userId: 'me',
          maxResults: MESSAGING_GMAIL_USERS_MESSAGES_LIST_MAX_RESULT,
          pageToken,
          labelIds: [messageFolder.externalId],
        })
        .catch((error) => {
          this.logger.error(
            `Connected account ${connectedAccount.id}: Error fetching message list for label ${messageFolder.externalId}: ${error.message}`,
          );

          this.gmailMessageListFetchErrorHandler.handleError(error);

          return {
            data: {
              messages: [],
              nextPageToken: undefined,
            },
          };
        });

      const { messages } = messageList.data;
      const hasMessages = messages && messages.length > 0;

      if (!hasMessages) {
        break;
      }

      pageToken = messageList.data.nextPageToken ?? undefined;
      hasMoreMessages = !!pageToken;

      // @ts-expect-error legacy noImplicitAny
      messageExternalIds.push(...messages.map((message) => message.id));
    }

    this.logger.log(
      `Connected account ${connectedAccount.id}: Found ${messageExternalIds.length} messages in label ${messageFolder.externalId}`,
    );

    return messageExternalIds;
  }
}
