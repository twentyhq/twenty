import { Injectable, Logger } from '@nestjs/common';

import { google } from 'googleapis';

import {
  DiscoveredMessageFolder,
  MessageFolderDriver,
} from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { GmailFoldersErrorHandlerService } from 'src/modules/messaging/message-folder-manager/drivers/gmail/services/gmail-folders-error-handler.service';
import { extractGmailFolderName } from 'src/modules/messaging/message-folder-manager/drivers/gmail/utils/extract-gmail-folder-name.util';
import { getGmailFolderParentId } from 'src/modules/messaging/message-folder-manager/drivers/gmail/utils/get-gmail-folder-parent-id.util';
import { shouldSyncFolderByDefault } from 'src/modules/messaging/message-folder-manager/utils/should-sync-folder-by-default.util';
import { MESSAGING_GMAIL_DEFAULT_NOT_SYNCED_LABELS } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-default-not-synced-labels';

@Injectable()
export class GmailGetAllFoldersService implements MessageFolderDriver {
  private readonly logger = new Logger(GmailGetAllFoldersService.name);

  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
    private readonly gmailFoldersErrorHandlerService: GmailFoldersErrorHandlerService,
  ) {}

  async getAllMessageFolders(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'accessToken' | 'id' | 'handle'
    >,
    messageChannel: Pick<
      MessageChannelWorkspaceEntity,
      'messageFolderImportPolicy'
    >,
  ): Promise<DiscoveredMessageFolder[]> {
    try {
      const oAuth2Client =
        await this.oAuth2ClientManagerService.getGoogleOAuth2Client(
          connectedAccount,
        );

      const gmailClient = google.gmail({
        version: 'v1',
        auth: oAuth2Client,
      });

      const response = await gmailClient.users.labels
        .list({ userId: 'me' })
        .catch((error) => {
          this.logger.error(
            `Connected account ${connectedAccount.id}: Error fetching labels: ${error.message}`,
          );

          this.gmailFoldersErrorHandlerService.handleError(error);

          return { data: { labels: [] } };
        });

      const labels = response.data.labels || [];

      const folders: DiscoveredMessageFolder[] = [];

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

        if (MESSAGING_GMAIL_DEFAULT_NOT_SYNCED_LABELS.includes(label.id)) {
          continue;
        }

        const isSentFolder = label.id === 'SENT';
        const folderName = extractGmailFolderName(label.name);
        const parentFolderId = getGmailFolderParentId(
          label.name,
          labelNameToIdMap,
        );
        const isSynced = shouldSyncFolderByDefault(
          messageChannel.messageFolderImportPolicy,
        );

        folders.push({
          externalId: label.id,
          name: folderName,
          isSynced,
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
