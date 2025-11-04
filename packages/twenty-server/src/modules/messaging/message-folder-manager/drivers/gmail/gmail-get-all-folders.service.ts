import { Injectable, Logger } from '@nestjs/common';

import {
  MessageFolder,
  MessageFolderDriver,
} from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { extractGmailFolderName } from 'src/modules/messaging/message-folder-manager/drivers/gmail/utils/extract-gmail-folder-name.util';
import { getGmailFolderParentId } from 'src/modules/messaging/message-folder-manager/drivers/gmail/utils/get-gmail-folder-parent-id.util';
import { MESSAGING_GMAIL_DEFAULT_NOT_SYNCED_LABELS } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-default-not-synced-labels';
import { GmailMessageListFetchErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-message-list-fetch-error-handler.service';

@Injectable()
export class GmailGetAllFoldersService implements MessageFolderDriver {
  private readonly logger = new Logger(GmailGetAllFoldersService.name);

  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
    private readonly gmailMessageListFetchErrorHandler: GmailMessageListFetchErrorHandler,
  ) {}

  private isSyncedByDefault(labelId: string): boolean {
    return !MESSAGING_GMAIL_DEFAULT_NOT_SYNCED_LABELS.includes(labelId);
  }

  async getAllMessageFolders(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'accessToken' | 'id' | 'handle'
    >,
  ): Promise<MessageFolder[]> {
    try {
      const oAuth2Client =
        await this.oAuth2ClientManagerService.getGoogleOAuth2Client(
          connectedAccount,
        );

      const gmailClient = oAuth2Client.gmail({ version: 'v1' });

      const response = await gmailClient.users.labels
        .list({ userId: 'me' })
        .catch((error) => {
          this.logger.error(
            `Connected account ${connectedAccount.id}: Error fetching labels: ${error.message}`,
          );

          this.gmailMessageListFetchErrorHandler.handleError(error);

          return { data: { labels: [] } };
        });

      const labels = response.data.labels || [];

      const folders: MessageFolder[] = [];

      const labelNameToIdMap = new Map<string, string>();

      for (const label of labels) {
        if (!label.name || !label.id) {
          continue;
        }

        labelNameToIdMap.set(label.name, label.id);
      }

      for (const label of labels) {
        if (!label.name || !label.id) {
          continue;
        }

        const isSentFolder = label.id === 'SENT';
        const folderName = extractGmailFolderName(label.name);
        const parentFolderId = getGmailFolderParentId(
          label.name,
          labelNameToIdMap,
        );

        folders.push({
          externalId: label.id,
          name: folderName,
          isSynced: this.isSyncedByDefault(label.id),
          isSentFolder,
          parentFolderId,
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
