import { Injectable } from '@nestjs/common';

import { gmail_v1 } from 'googleapis';

import { MESSAGING_GMAIL_EXCLUDED_CATEGORIES } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-excluded-categories';
import { MessagingGmailHistoryService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/messaging-gmail-history.service';
import { computeGmailCategoryLabelId } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-gmail-category-label-id';
import { assertNotNull } from 'src/utils/assert';

@Injectable()
export class MessagingGmailFetchMessageIdsToExcludeService {
  constructor(
    private readonly gmailGetHistoryService: MessagingGmailHistoryService,
  ) {}

  public async fetchEmailIdsToExcludeOrThrow(
    gmailClient: gmail_v1.Gmail,
    lastSyncHistoryId: string,
  ): Promise<string[]> {
    const emailIds: string[] = [];

    for (const category of MESSAGING_GMAIL_EXCLUDED_CATEGORIES) {
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
