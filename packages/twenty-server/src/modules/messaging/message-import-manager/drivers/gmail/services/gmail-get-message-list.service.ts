import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type gmail_v1 as gmailV1, google } from 'googleapis';

import { MessageFolderImportPolicy } from 'twenty-shared/types';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { GoogleOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client.provider';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { MESSAGING_GMAIL_USERS_THREADS_LIST_MAX_RESULT } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-users-threads-list-max-result.constant';
import { GmailGetHistoryService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-history.service';
import { GmailMessageListFetchErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-message-list-fetch-error-handler.service';
import { buildGmailRetryConfig } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/build-gmail-retry-config.util';
import { computeGmailExcludeSearchFilter } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-gmail-exclude-search-filter.util';
import { type GetMessageListsArgs } from 'src/modules/messaging/message-import-manager/types/get-message-lists-args.type';
import { type GetMessageListsResponse } from 'src/modules/messaging/message-import-manager/types/get-message-lists-response.type';

type GmailThreadListItem = {
  id: string;
  historyId: string | null;
};

@Injectable()
export class GmailGetMessageListService {
  private readonly logger = new Logger(GmailGetMessageListService.name);
  constructor(
    private readonly gmailGetHistoryService: GmailGetHistoryService,
    private readonly googleOAuth2ClientProvider: GoogleOAuth2ClientProvider,
    private readonly gmailMessageListFetchErrorHandler: GmailMessageListFetchErrorHandler,
  ) {}

  async getMessageListWithoutCursor(
    connectedAccount: Pick<
      ConnectedAccountEntity,
      'provider' | 'id' | 'handle'
    >,
    messageFolders: Pick<
      MessageFolderEntity,
      'name' | 'externalId' | 'isSynced' | 'parentFolderId'
    >[],
    messageChannel: Pick<MessageChannelEntity, 'messageFolderImportPolicy'>,
  ): Promise<GetMessageListsResponse> {
    const oAuth2Client = await this.googleOAuth2ClientProvider.getClient(
      connectedAccount.id,
    );
    const gmailClient = google.gmail({
      version: 'v1',
      auth: oAuth2Client,
      retryConfig: buildGmailRetryConfig(),
    });

    const excludedSearchFilter = computeGmailExcludeSearchFilter(
      messageFolders,
      messageChannel.messageFolderImportPolicy,
    );

    const threads = await this.listThreads(
      gmailClient,
      connectedAccount,
      excludedSearchFilter,
    );

    if (threads.length === 0) {
      return [
        {
          messageExternalIds: [],
          nextSyncCursor: '',
          previousSyncCursor: '',
          messageExternalIdsToDelete: [],
          folderId: undefined,
        },
      ];
    }

    const nextSyncCursor = threads[0].historyId;

    if (!isNonEmptyString(nextSyncCursor)) {
      throw new MessageImportDriverException(
        `No historyId found for thread ${threads[0].id} for connected account ${connectedAccount.id}`,
        MessageImportDriverExceptionCode.NO_NEXT_SYNC_CURSOR,
      );
    }

    return [
      {
        messageExternalIds: threads.map((thread) => thread.id),
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
    if (
      messageChannel.messageFolderImportPolicy ===
      MessageFolderImportPolicy.SELECTED_FOLDERS
    ) {
      const foldersToSync = messageFolders.filter((folder) => folder.isSynced);

      if (foldersToSync.length === 0) {
        this.logger.warn(
          `Connected account ${connectedAccount.id} Message Channel: ${messageChannel.id}: No folders to process`,
        );

        return [];
      }
    }

    const oAuth2Client = await this.googleOAuth2ClientProvider.getClient(
      connectedAccount.id,
    );
    const gmailClient = google.gmail({
      version: 'v1',
      auth: oAuth2Client,
      retryConfig: buildGmailRetryConfig(),
    });

    if (!isNonEmptyString(messageChannel.syncCursor)) {
      return this.getMessageListWithoutCursor(
        connectedAccount,
        messageFolders,
        messageChannel,
      );
    }

    const { history, historyId: nextSyncCursor } =
      await this.gmailGetHistoryService.getHistory(
        gmailClient,
        messageChannel.syncCursor,
      );

    const { threadIdsToFetch, messageExternalIdsToDelete } =
      await this.gmailGetHistoryService.getThreadIdsFromHistory(history);

    if (!nextSyncCursor) {
      throw new MessageImportDriverException(
        `No nextSyncCursor found for connected account ${connectedAccount.id}`,
        MessageImportDriverExceptionCode.NO_NEXT_SYNC_CURSOR,
      );
    }

    return [
      {
        messageExternalIds: threadIdsToFetch,
        messageExternalIdsToDelete,
        previousSyncCursor: messageChannel.syncCursor,
        nextSyncCursor,
        folderId: undefined,
      },
    ];
  }

  private async listThreads(
    gmailClient: gmailV1.Gmail,
    connectedAccount: Pick<ConnectedAccountEntity, 'id'>,
    searchFilter: string,
  ): Promise<GmailThreadListItem[]> {
    const threads: GmailThreadListItem[] = [];
    let pageToken: string | undefined;
    let hasMoreThreads = true;

    while (hasMoreThreads) {
      const threadList = await gmailClient.users.threads
        .list({
          userId: 'me',
          maxResults: MESSAGING_GMAIL_USERS_THREADS_LIST_MAX_RESULT,
          pageToken,
          q: searchFilter,
        })
        .catch((error) => {
          this.logger.error(
            `Connected account ${connectedAccount.id}: Error fetching thread list: ${JSON.stringify(error)}`,
          );

          this.gmailMessageListFetchErrorHandler.handleError(error);

          return {
            data: {
              threads: [],
              nextPageToken: undefined,
            },
          };
        });

      const pageThreads = threadList.data.threads;
      const hasThreads = pageThreads && pageThreads.length > 0;

      if (!hasThreads) {
        break;
      }

      pageToken = threadList.data.nextPageToken ?? undefined;
      hasMoreThreads = !!pageToken;

      for (const pageThread of pageThreads) {
        if (isNonEmptyString(pageThread.id)) {
          threads.push({
            id: pageThread.id,
            historyId: pageThread.historyId ?? null,
          });
        }
      }
    }

    return threads;
  }
}
