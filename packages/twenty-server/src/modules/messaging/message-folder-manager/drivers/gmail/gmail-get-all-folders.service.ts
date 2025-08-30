import { Injectable, Logger } from '@nestjs/common';

import { gmail_v1 } from 'googleapis';
import { isDefined } from 'twenty-shared/utils';

import {
  MessageFolder,
  MessageFolderDriver,
} from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MESSAGING_GMAIL_EXCLUDED_CATEGORIES } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-excluded-categories';
import { GmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/gmail-client.provider';
import { GmailHandleErrorService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-handle-error.service';
import { computeGmailCategoryLabelId } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-gmail-category-label-id.util';

@Injectable()
export class GmailGetAllFoldersService implements MessageFolderDriver {
  private readonly logger = new Logger(GmailGetAllFoldersService.name);

  constructor(
    private readonly gmailClientProvider: GmailClientProvider,
    private readonly gmailHandleErrorService: GmailHandleErrorService,
  ) {}

  private isExcludedCategoryFolder(labelId: string): boolean {
    const excludedCategoryIds = MESSAGING_GMAIL_EXCLUDED_CATEGORIES.map(
      (category) => computeGmailCategoryLabelId(category),
    );

    return excludedCategoryIds.includes(labelId);
  }

  private isIncludedFolder(label: gmail_v1.Schema$Label): boolean {
    if (!isDefined(label.id)) {
      return false;
    }

    const isTargetSystemFolder =
      label.type === 'system' && (label.id === 'INBOX' || label.id === 'SENT');
    const isUserFolder = label.type === 'user';

    return isTargetSystemFolder || isUserFolder;
  }

  async getAllMessageFolders(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'id' | 'handle'
    >,
  ): Promise<MessageFolder[]> {
    try {
      const gmailClient =
        await this.gmailClientProvider.getGmailClient(connectedAccount);

      const response = await gmailClient.users.labels
        .list({ userId: 'me' })
        .catch((error) => {
          this.logger.error(
            `Connected account ${connectedAccount.id}: Error fetching labels: ${error.message}`,
          );

          this.gmailHandleErrorService.handleGmailMessageListFetchError(error);

          return { data: { labels: [] } };
        });

      const labels = response.data.labels || [];

      const folders: MessageFolder[] = [];

      for (const label of labels) {
        if (!label.name || !label.id) {
          continue;
        }

        if (this.isExcludedCategoryFolder(label.id)) {
          continue;
        }

        if (!this.isIncludedFolder(label)) {
          continue;
        }

        const isSentFolder = label.id === 'SENT';
        const isSyncedByDefault = label.id === 'INBOX' || label.id === 'SENT';

        folders.push({
          externalId: label.id,
          name: label.name,
          isSynced: isSyncedByDefault,
          isSentFolder,
        });
      }

      this.logger.log(
        `Found ${folders.length} folders for Gmail account ${connectedAccount.handle}`,
      );

      return folders;
    } catch (error) {
      this.logger.error(
        `Failed to get Gmail folders for account ${connectedAccount.handle}:`,
        error,
      );

      throw error;
    }
  }
}
