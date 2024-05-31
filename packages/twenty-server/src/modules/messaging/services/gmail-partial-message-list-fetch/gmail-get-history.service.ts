import { Injectable } from '@nestjs/common';

import { gmail_v1 } from 'googleapis';
import { GaxiosResponse } from 'gaxios';

import { GMAIL_USERS_HISTORY_MAX_RESULT } from 'src/modules/messaging/constants/gmail-users-history-max-result.constant';
import { GmailError } from 'src/modules/messaging/services/gmail-error-handling/gmail-error-handling.service';

@Injectable()
export class GmailGetHistoryService {
  constructor() {}

  public async getHistory(
    gmailClient: gmail_v1.Gmail,
    lastSyncHistoryId: string,
  ): Promise<{
    history: gmail_v1.Schema$History[];
    historyId?: string | null;
    error?: GmailError;
  }> {
    const fullHistory: gmail_v1.Schema$History[] = [];
    let pageToken: string | undefined;
    let hasMoreMessages = true;
    let nextHistoryId: string | undefined;
    let response: GaxiosResponse<gmail_v1.Schema$ListHistoryResponse>;

    while (hasMoreMessages) {
      try {
        response = await gmailClient.users.history.list({
          userId: 'me',
          maxResults: GMAIL_USERS_HISTORY_MAX_RESULT,
          pageToken,
          startHistoryId: lastSyncHistoryId,
          historyTypes: ['messageAdded', 'messageDeleted'],
        });
      } catch (error) {
        return {
          history: [],
          error: {
            code: error.response?.status,
            reason: error.response?.data?.error,
          },
          historyId: lastSyncHistoryId,
        };
      }

      nextHistoryId = response?.data?.historyId ?? undefined;

      if (response?.data?.history) {
        fullHistory.push(...response.data.history);
      }

      pageToken = response?.data?.nextPageToken ?? undefined;
      hasMoreMessages = !!pageToken;
    }

    return { history: fullHistory, historyId: nextHistoryId };
  }

  public async getMessageIdsFromHistory(
    history: gmail_v1.Schema$History[],
  ): Promise<{
    messagesAdded: string[];
    messagesDeleted: string[];
  }> {
    const { messagesAdded, messagesDeleted } = history.reduce(
      (
        acc: {
          messagesAdded: string[];
          messagesDeleted: string[];
        },
        history,
      ) => {
        const messagesAdded = history.messagesAdded?.map(
          (messageAdded) => messageAdded.message?.id || '',
        );

        const messagesDeleted = history.messagesDeleted?.map(
          (messageDeleted) => messageDeleted.message?.id || '',
        );

        if (messagesAdded) acc.messagesAdded.push(...messagesAdded);
        if (messagesDeleted) acc.messagesDeleted.push(...messagesDeleted);

        return acc;
      },
      { messagesAdded: [], messagesDeleted: [] },
    );

    const uniqueMessagesAdded = messagesAdded.filter(
      (messageId) => !messagesDeleted.includes(messageId),
    );

    const uniqueMessagesDeleted = messagesDeleted.filter(
      (messageId) => !messagesAdded.includes(messageId),
    );

    return {
      messagesAdded: uniqueMessagesAdded,
      messagesDeleted: uniqueMessagesDeleted,
    };
  }
}
