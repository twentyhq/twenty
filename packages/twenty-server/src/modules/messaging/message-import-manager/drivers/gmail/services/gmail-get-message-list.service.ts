import { Injectable } from '@nestjs/common';

import { gmail_v1 as gmailV1 } from 'googleapis';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { MESSAGING_GMAIL_EXCLUDED_CATEGORIES } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-excluded-categories';
import { MESSAGING_GMAIL_USERS_MESSAGES_LIST_MAX_RESULT } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-users-messages-list-max-result.constant';
import { GmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/gmail-client.provider';
import { GmailGetHistoryService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-history.service';
import { GmailHandleErrorService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-handle-error.service';
import { computeGmailCategoryExcludeSearchFilter } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-gmail-category-excude-search-filter.util';
import { computeGmailCategoryLabelId } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-gmail-category-label-id.util';
import {
  GetFullMessageListResponse,
  GetPartialMessageListResponse,
} from 'src/modules/messaging/message-import-manager/services/messaging-get-message-list.service';
import { assertNotNull } from 'src/utils/assert';
import { isDefined } from 'src/utils/is-defined';

@Injectable()
export class GmailGetMessageListService {
  constructor(
    private readonly gmailClientProvider: GmailClientProvider,
    private readonly gmailGetHistoryService: GmailGetHistoryService,
    private readonly gmailHandleErrorService: GmailHandleErrorService,
  ) {}

  public async getFullMessageList(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'id' | 'handle'
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
          this.gmailHandleErrorService.handleGmailMessageListFetchError(error);

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
        firstMessageExternalId = messageList.data.messages?.[0].id ?? undefined;
      }

      messageExternalIds.push(...messages.map((message) => message.id));
    }

    if (!isDefined(firstMessageExternalId)) {
      throw new MessageImportDriverException(
        `No firstMessageExternalId found for connected account ${connectedAccount.id}`,
        MessageImportDriverExceptionCode.UNKNOWN,
      );
    }

    const firstMessageContent = await gmailClient.users.messages
      .get({
        userId: 'me',
        id: firstMessageExternalId,
      })
      .catch((error) => {
        this.gmailHandleErrorService.handleGmailMessagesImportError(
          error,
          firstMessageExternalId as string,
        );
      });

    const nextSyncCursor = firstMessageContent?.data?.historyId;

    if (!nextSyncCursor) {
      throw new MessageImportDriverException(
        `No historyId found for message ${firstMessageExternalId} for connected account ${connectedAccount.id}`,
        MessageImportDriverExceptionCode.NO_NEXT_SYNC_CURSOR,
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

    const messageIdsToFilter = await this.getEmailIdsFromExcludedCategories(
      gmailClient,
      syncCursor,
    );

    const messagesAddedFiltered = messagesAdded.filter(
      (messageId) => !messageIdsToFilter.includes(messageId),
    );

    if (!nextSyncCursor) {
      throw new MessageImportDriverException(
        `No nextSyncCursor found for connected account ${connectedAccount.id}`,
        MessageImportDriverExceptionCode.NO_NEXT_SYNC_CURSOR,
      );
    }

    return {
      messageExternalIds: messagesAddedFiltered,
      messageExternalIdsToDelete: messagesDeleted,
      nextSyncCursor,
    };
  }

  private async getEmailIdsFromExcludedCategories(
    gmailClient: gmailV1.Gmail,
    lastSyncHistoryId: string,
  ): Promise<string[]> {
    const emailIds: string[] = [];

    for (const category of MESSAGING_GMAIL_EXCLUDED_CATEGORIES) {
      const { history } = await this.gmailGetHistoryService.getHistory(
        gmailClient,
        lastSyncHistoryId,
        ['messageAdded'],
        computeGmailCategoryLabelId(category),
      );

      const emailIdsFromCategory = history
        .map((history) => history.messagesAdded)
        .flat()
        .map((message) => message?.message?.id)
        .filter((id) => id)
        .filter(assertNotNull);

      emailIds.push(...emailIdsFromCategory);
    }

    return emailIds;
  }
}
