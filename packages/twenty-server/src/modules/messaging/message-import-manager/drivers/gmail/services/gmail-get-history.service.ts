import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type gmail_v1 } from 'googleapis';
import { isDefined } from 'twenty-shared/utils';

import { MESSAGING_GMAIL_USERS_HISTORY_MAX_RESULT } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-users-history-max-result.constant';
import { GmailMessageListFetchErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-message-list-fetch-error-handler.service';

@Injectable()
export class GmailGetHistoryService {
  constructor(
    private readonly gmailMessageListFetchErrorHandler: GmailMessageListFetchErrorHandler,
  ) {}

  public async getHistory(
    gmailClient: gmail_v1.Gmail,
    lastSyncHistoryId: string,
  ): Promise<{
    history: gmail_v1.Schema$History[];
    historyId?: string | null;
  }> {
    const fullHistory: gmail_v1.Schema$History[] = [];
    let pageToken: string | undefined;
    let hasMoreMessages = true;
    let nextHistoryId: string | undefined;

    while (hasMoreMessages) {
      const response = await gmailClient.users.history
        .list({
          userId: 'me',
          maxResults: MESSAGING_GMAIL_USERS_HISTORY_MAX_RESULT,
          pageToken,
          startHistoryId: lastSyncHistoryId,
          historyTypes: [
            'messageAdded',
            'messageDeleted',
            'labelAdded',
            'labelRemoved',
          ],
        })
        .catch((error) => {
          this.gmailMessageListFetchErrorHandler.handleError(error);

          return {
            data: {
              history: [],
              historyId: lastSyncHistoryId,
              nextPageToken: undefined,
            },
          };
        });

      nextHistoryId = response?.data?.historyId ?? undefined;

      if (response?.data?.history) {
        fullHistory.push(...response.data.history);
      }

      pageToken = response?.data?.nextPageToken ?? undefined;
      hasMoreMessages = !!pageToken;
    }

    return { history: fullHistory, historyId: nextHistoryId };
  }

  public async getThreadIdsFromHistory(
    history: gmail_v1.Schema$History[],
  ): Promise<{
    threadIdsToFetch: string[];
    messageExternalIdsToDelete: string[];
  }> {
    const threadIds = new Set<string>();
    const deletedMessageIds = new Set<string>();

    for (const historyEntry of history) {
      const addedMessages = [
        ...(historyEntry.messagesAdded ?? []),
        ...(historyEntry.labelsAdded ?? []),
      ]
        .map((addedEntry) => addedEntry.message)
        .filter(isDefined);

      for (const message of addedMessages) {
        const threadId = message.threadId ?? message.id;

        if (isNonEmptyString(threadId)) {
          threadIds.add(threadId);
        }
      }

      for (const messageDeleted of historyEntry.messagesDeleted ?? []) {
        const deletedMessageId = messageDeleted.message?.id;

        if (isNonEmptyString(deletedMessageId)) {
          deletedMessageIds.add(deletedMessageId);
        }
      }
    }

    return {
      threadIdsToFetch: [...threadIds],
      messageExternalIdsToDelete: [...deletedMessageIds],
    };
  }
}
