import { Injectable, Logger } from '@nestjs/common';

import {
  MessageFolder,
  MessageFolderDriver,
} from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MESSAGING_GMAIL_DEFAULT_NOT_SYNCED_LABELS } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-default-not-synced-labels';
import { GmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/gmail-client.provider';
import { GmailHandleErrorService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-handle-error.service';

@Injectable()
export class GmailGetAllFoldersService implements MessageFolderDriver {
  private readonly logger = new Logger(GmailGetAllFoldersService.name);

  constructor(
    private readonly gmailClientProvider: GmailClientProvider,
    private readonly gmailHandleErrorService: GmailHandleErrorService,
  ) {}

  private isSyncedByDefault(labelId: string): boolean {
    return !MESSAGING_GMAIL_DEFAULT_NOT_SYNCED_LABELS.includes(labelId);
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

        const isSentFolder = label.id === 'SENT';

        folders.push({
          externalId: label.id,
          name: label.name,
          isSynced: this.isSyncedByDefault(label.id),
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
