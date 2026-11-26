import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type gmail_v1 as gmailV1, google } from 'googleapis';
import { isDefined } from 'twenty-shared/utils';

import { MessageFolderImportPolicy } from 'twenty-shared/types';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { GoogleOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client.provider';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { MESSAGING_GMAIL_FULL_SYNC_LIST_CONCURRENCY } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-full-sync-list-concurrency.constant';
import { MESSAGING_GMAIL_USERS_MESSAGES_LIST_MAX_RESULT } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-users-messages-list-max-result.constant';
import { GmailGetHistoryService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-history.service';
import { GmailMessageListFetchErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-message-list-fetch-error-handler.service';
import { computeGmailFullSyncListQueries } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-gmail-full-sync-list-queries.util';
import { type GetMessageListsArgs } from 'src/modules/messaging/message-import-manager/types/get-message-lists-args.type';
import { type GetMessageListsResponse } from 'src/modules/messaging/message-import-manager/types/get-message-lists-response.type';

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
    messageFolders: Pick<MessageFolderEntity, 'externalId' | 'isSynced'>[],
    messageChannel: Pick<MessageChannelEntity, 'messageFolderImportPolicy'>,
  ): Promise<GetMessageListsResponse> {
    const oAuth2Client = await this.googleOAuth2ClientProvider.getClient(
      connectedAccount.id,
    );
    const gmailClient = google.gmail({
      version: 'v1',
      auth: oAuth2Client,
    });

    const profile = await gmailClient.users
      .getProfile({ userId: 'me' })
      .catch((error) => {
        this.gmailMessageListFetchErrorHandler.handleError(error);
      });

    const nextSyncCursor = profile?.data?.historyId;

    if (!isNonEmptyString(nextSyncCursor)) {
      throw new MessageImportDriverException(
        `No historyId found in profile for connected account ${connectedAccount.id}`,
        MessageImportDriverExceptionCode.NO_NEXT_SYNC_CURSOR,
      );
    }

    const listQueries = computeGmailFullSyncListQueries({
      messageFolders,
      messageFolderImportPolicy: messageChannel.messageFolderImportPolicy,
    });

    const messageExternalIds = new Set<string>();
    const pendingListQueries = [...listQueries];

    const runPendingListQueries = async () => {
      for (
        let listQuery = pendingListQueries.shift();
        isDefined(listQuery);
        listQuery = pendingListQueries.shift()
      ) {
        for (const messageExternalId of await this.listMessageExternalIds({
          gmailClient,
          connectedAccount,
          listQuery,
        })) {
          messageExternalIds.add(messageExternalId);
        }
      }
    };

    await Promise.all(
      Array.from(
        { length: MESSAGING_GMAIL_FULL_SYNC_LIST_CONCURRENCY },
        runPendingListQueries,
      ),
    );

    return [
      {
        messageExternalIds: [...messageExternalIds],
        nextSyncCursor,
        previousSyncCursor: '',
        messageExternalIdsToDelete: [],
        folderId: undefined,
      },
    ];
  }

  private async listMessageExternalIds({
    gmailClient,
    connectedAccount,
    listQuery,
  }: {
    gmailClient: gmailV1.Gmail;
    connectedAccount: Pick<ConnectedAccountEntity, 'id'>;
    listQuery: { labelIds?: string[]; searchFilter: string };
  }): Promise<string[]> {
    const messageExternalIds: string[] = [];
    let pageToken: string | undefined;
    let hasMoreMessages = true;

    while (hasMoreMessages) {
      const messageList = await gmailClient.users.messages
        .list({
          userId: 'me',
          maxResults: MESSAGING_GMAIL_USERS_MESSAGES_LIST_MAX_RESULT,
          pageToken,
          labelIds: listQuery.labelIds,
          q: listQuery.searchFilter,
        })
        .catch((error) => {
          this.logger.error(
            `Connected account ${connectedAccount.id}: Error fetching message list: ${error.message}`,
          );
          this.logger.error(
            `Connected account ${connectedAccount.id}: Error fetching message list: ${JSON.stringify(error)}`,
          );

          this.gmailMessageListFetchErrorHandler.handleError(error);

          return {
            data: {
              messages: [],
              nextPageToken: undefined,
            },
          };
        });

      const messages = messageList.data.messages ?? [];

      if (messages.length === 0) {
        break;
      }

      pageToken = messageList.data.nextPageToken ?? undefined;
      hasMoreMessages = isNonEmptyString(pageToken);

      for (const message of messages) {
        if (isNonEmptyString(message.id)) {
          messageExternalIds.push(message.id);
        }
      }
    }

    return messageExternalIds;
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

    const { messagesAdded, messagesDeleted } =
      await this.gmailGetHistoryService.getMessageIdsFromHistory(history);

    if (!isNonEmptyString(nextSyncCursor)) {
      throw new MessageImportDriverException(
        `No nextSyncCursor found for connected account ${connectedAccount.id}`,
        MessageImportDriverExceptionCode.NO_NEXT_SYNC_CURSOR,
      );
    }

    return [
      {
        messageExternalIds: messagesAdded,
        messageExternalIdsToDelete: messagesDeleted,
        previousSyncCursor: messageChannel.syncCursor,
        nextSyncCursor,
        folderId: undefined,
      },
    ];
  }
}
