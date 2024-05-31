import { Injectable } from '@nestjs/common';

import { gmail_v1 } from 'googleapis';

import { GmailGetHistoryService } from 'src/modules/messaging/services/gmail-partial-message-list-fetch/gmail-get-history.service';
import { excludedLabelIds } from 'src/modules/messaging/utils/gmail-search-filter.util';

@Injectable()
export class GmailGetEmailIdsToFilterService {
  constructor(
    private readonly gmailGetHistoryService: GmailGetHistoryService,
  ) {}

  public async fetchEmailIdsToFilter(
    gmailClient: gmail_v1.Gmail,
    lastSyncHistoryId: string,
  ): Promise<string[]> {
    const fullHistory: gmail_v1.Schema$History[] = [];

    for (const labelId of excludedLabelIds) {
      const { history, error } = await this.gmailGetHistoryService.getHistory(
        gmailClient,
        lastSyncHistoryId,
        ['messageAdded'],
        labelId,
      );

      if (error) {
        return [];
      }

      fullHistory.push(...history);
    }

    const emailIds = fullHistory
      .map((history) => history.messagesAdded)
      .flat()
      .map((message) => message?.message?.id)
      .filter((id) => id) as string[];

    return emailIds;
  }
}
