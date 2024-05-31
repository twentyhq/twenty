import { Injectable } from '@nestjs/common';

import { gmail_v1 } from 'googleapis';

import { GMAIL_EXCLUDED_CATEGORIES } from 'src/modules/messaging/constants/gmail-excluded-categories';
import { GmailGetHistoryService } from 'src/modules/messaging/services/gmail-partial-message-list-fetch/gmail-get-history.service';
import { computeGmailCategoryLabelId } from 'src/modules/messaging/utils/compute-gmail-category-label-id';
import { assertNotNull } from 'src/utils/assert';

@Injectable()
export class GmailFetchMessageIdsToExcludeService {
  constructor(
    private readonly gmailGetHistoryService: GmailGetHistoryService,
  ) {}

  public async fetchEmailIdsToExcludeOrThrow(
    gmailClient: gmail_v1.Gmail,
    lastSyncHistoryId: string,
  ): Promise<string[]> {
    const emailIds: string[] = [];

    for (const category of GMAIL_EXCLUDED_CATEGORIES) {
      const { history, error } = await this.gmailGetHistoryService.getHistory(
        gmailClient,
        lastSyncHistoryId,
        ['messageAdded'],
        computeGmailCategoryLabelId(category),
      );

      if (error) {
        throw error;
      }

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
