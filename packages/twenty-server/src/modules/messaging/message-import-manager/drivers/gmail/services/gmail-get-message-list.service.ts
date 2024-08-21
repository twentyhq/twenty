import { Injectable } from '@nestjs/common';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MESSAGING_GMAIL_EXCLUDED_CATEGORIES } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-excluded-categories';
import { MESSAGING_GMAIL_USERS_MESSAGES_LIST_MAX_RESULT } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-users-messages-list-max-result.constant';
import { GmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/gmail-client.provider';
import { MessagingGmailFetchMessageIdsToExcludeService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/messaging-gmail-fetch-messages-ids-to-exclude.service';
import { MessagingGmailHistoryService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/messaging-gmail-history.service';
import { computeGmailCategoryExcludeSearchFilter } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-gmail-category-excude-search-filter';
import {
  GetFullMessageListResponse,
  GetPartialMessageListResponse,
} from 'src/modules/messaging/message-import-manager/services/messaging-get-message-list.service';

@Injectable()
export class GmailGetMessageListService {
  constructor(
    private readonly gmailClientProvider: GmailClientProvider,
    private readonly gmailGetHistoryService: MessagingGmailHistoryService,
    private readonly gmailFetchMessageIdsToExcludeService: MessagingGmailFetchMessageIdsToExcludeService,
  ) {}

  public async getFullMessageList(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'id'
    >,
  ): Promise<GetFullMessageListResponse> {
    const gmailClient =
      await this.gmailClientProvider.getGmailClient(connectedAccount);

    let pageToken: string | undefined;
    let hasMoreMessages = true;
    let firstMessageExternalId: string | undefined;
    const messageExternalIds: string[] = [];

    while (hasMoreMessages) {
      const messageList = await gmailClient.users.messages
        .list({
          userId: 'me',
          maxResults: MESSAGING_GMAIL_USERS_MESSAGES_LIST_MAX_RESULT,
          pageToken,
          q: computeGmailCategoryExcludeSearchFilter(
            MESSAGING_GMAIL_EXCLUDED_CATEGORIES,
          ),
        })
        .catch((error) => {
          // this.handleError(error);
          return {
            data: {
              messages: [],
              nextPageToken: undefined,
            },
          };
        });

      pageToken = messageList.data.nextPageToken ?? undefined;
      hasMoreMessages = !!pageToken;

      const { messages } = messageList.data;

      if (!messages || messages.length === 0) {
        break;
      }

      if (!firstMessageExternalId) {
        firstMessageExternalId = messageExternalIds[0];
      }

      messageExternalIds.push(...messages.map((message) => message.id));
    }

    const firstMessageContent = await gmailClient.users.messages.get({
      userId: 'me',
      id: firstMessageExternalId,
    });

    const nextSyncCursor = firstMessageContent?.data?.historyId;

    if (!nextSyncCursor) {
      throw new Error(
        `No historyId found for message ${firstMessageExternalId}`,
      );
    }

    return { messageExternalIds, nextSyncCursor };
  }

  public async getPartialMessageList(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'id'
    >,
    syncCursor: string,
  ): Promise<GetPartialMessageListResponse> {
    const gmailClient =
      await this.gmailClientProvider.getGmailClient(connectedAccount);

    const { history, historyId: nextSyncCursor } =
      await this.gmailGetHistoryService.getHistory(gmailClient, syncCursor);

    const { messagesAdded, messagesDeleted } =
      await this.gmailGetHistoryService.getMessageIdsFromHistory(history);

    const messageIdsToFilter =
      await this.gmailFetchMessageIdsToExcludeService.fetchEmailIdsToExcludeOrThrow(
        gmailClient,
        syncCursor,
      );

    const messagesAddedFiltered = messagesAdded.filter(
      (messageId) => !messageIdsToFilter.includes(messageId),
    );

    if (!nextSyncCursor) {
      throw new Error(`No nextSyncCursor found`);
    }

    return {
      messageExternalIds: messagesAddedFiltered,
      messageExternalIdsToDelete: messagesDeleted,
      nextSyncCursor,
    };
  }
}
