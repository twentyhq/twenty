import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type gmail_v1 as gmailV1 } from 'googleapis';
import { isDefined } from 'twenty-shared/utils';

import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { MESSAGING_GMAIL_USERS_MESSAGES_LIST_MAX_RESULT } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-users-messages-list-max-result.constant';
import { GmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/gmail-client.provider';
import { GmailGetHistoryService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-history.service';
import { GmailHandleErrorService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-handle-error.service';
import { computeGmailExcludeSearchFilter } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-gmail-exclude-search-filter.util';
import { type GetMessageListsArgs } from 'src/modules/messaging/message-import-manager/types/get-message-lists-args.type';
import { type GetMessageListsResponse } from 'src/modules/messaging/message-import-manager/types/get-message-lists-response.type';
import { assertNotNull } from 'src/utils/assert';

@Injectable()
export class GmailGetMessageListService {
  private readonly logger = new Logger(GmailGetMessageListService.name);
  constructor(
    private readonly gmailClientProvider: GmailClientProvider,
    private readonly gmailGetHistoryService: GmailGetHistoryService,
    private readonly gmailHandleErrorService: GmailHandleErrorService,
  ) {}

  private async getMessageListWithoutCursor(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'id' | 'handle'
    >,
    messageFolders: Pick<
      MessageFolderWorkspaceEntity,
      'name' | 'externalId' | 'isSynced'
    >[],
  ): Promise<GetMessageListsResponse> {
    const gmailClient =
      await this.gmailClientProvider.getGmailClient(connectedAccount);

    let pageToken: string | undefined;
    let hasMoreMessages = true;

    const messageExternalIds: string[] = [];

    const excludedSearchFilter =
      computeGmailExcludeSearchFilter(messageFolders);

    while (hasMoreMessages) {
      const messageList = await gmailClient.users.messages
        .list({
          userId: 'me',
          maxResults: MESSAGING_GMAIL_USERS_MESSAGES_LIST_MAX_RESULT,
          pageToken,
          q: excludedSearchFilter,
        })
        .catch((error) => {
          this.logger.error(
            `Connected account ${connectedAccount.id}: Error fetching message list: ${error.message}`,
          );
          this.logger.error(
            `Connected account ${connectedAccount.id}: Error fetching message list: ${JSON.stringify(error)}`,
          );

          this.gmailHandleErrorService.handleGmailMessageListFetchError(error);

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

    if (messageExternalIds.length === 0) {
      return [
        {
          messageExternalIds,
          nextSyncCursor: '',
          previousSyncCursor: '',
          messageExternalIdsToDelete: [],
          folderId: undefined,
        },
      ];
    }

    const firstMessageExternalId = messageExternalIds[0];
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

    return [
      {
        messageExternalIds,
        nextSyncCursor,
        previousSyncCursor: '',
        messageExternalIdsToDelete: [],
        folderId: undefined,
      },
    ];
  }

  public async getMessageLists({
    messageChannel,
    connectedAccount,
    messageFolders,
  }: GetMessageListsArgs): Promise<GetMessageListsResponse> {
    const gmailClient =
      await this.gmailClientProvider.getGmailClient(connectedAccount);

    if (!isNonEmptyString(messageChannel.syncCursor)) {
      return this.getMessageListWithoutCursor(connectedAccount, messageFolders);
    }

    const { history, historyId: nextSyncCursor } =
      await this.gmailGetHistoryService.getHistory(
        gmailClient,
        messageChannel.syncCursor,
      );

    const { messagesAdded, messagesDeleted } =
      await this.gmailGetHistoryService.getMessageIdsFromHistory(history);

    const messageIdsToFilter = await this.getEmailIdsFromExcludedFolders(
      gmailClient,
      messageChannel.syncCursor,
      messageFolders,
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

    return [
      {
        messageExternalIds: messagesAddedFiltered,
        messageExternalIdsToDelete: messagesDeleted,
        previousSyncCursor: messageChannel.syncCursor,
        nextSyncCursor,
        folderId: undefined,
      },
    ];
  }

  private async getEmailIdsFromExcludedFolders(
    gmailClient: gmailV1.Gmail,
    lastSyncHistoryId: string,
    messageFolders: Pick<
      MessageFolderWorkspaceEntity,
      'name' | 'externalId' | 'isSynced'
    >[],
  ): Promise<string[]> {
    const emailIds: string[] = [];

    const toBeExcludedFolders = messageFolders.filter(
      (folder) => !folder.isSynced,
    );

    for (const folder of toBeExcludedFolders) {
      if (!isDefined(folder.externalId)) {
        continue;
      }

      const { history } = await this.gmailGetHistoryService.getHistory(
        gmailClient,
        lastSyncHistoryId,
        ['messageAdded'],
        folder.externalId,
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
