import { Injectable, Logger } from '@nestjs/common';

import {
  MessageFolder,
  MessageFolderDriver,
} from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MicrosoftHandleErrorService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-handle-error.service';
import { StandardFolder } from 'src/modules/messaging/message-import-manager/drivers/types/standard-folder';
import { getStandardFolderByRegex } from 'src/modules/messaging/message-import-manager/drivers/utils/get-standard-folder-by-regex';

type MicrosoftGraphFolder = {
  id: string;
  displayName: string;
  childFolderCount?: number;
  parentFolderId?: string;
};

const MESSAGING_MICROSOFT_MAIL_FOLDERS_LIST_MAX_RESULT = 999;

@Injectable()
export class MicrosoftGetAllFoldersService implements MessageFolderDriver {
  private readonly logger = new Logger(MicrosoftGetAllFoldersService.name);

  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,

    private readonly microsoftHandleErrorService: MicrosoftHandleErrorService,
  ) {}

  async getAllMessageFolders(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'accessToken' | 'refreshToken' | 'id' | 'handle' | 'provider'
    >,
  ): Promise<MessageFolder[]> {
    try {
      const microsoftClient =
        await this.oAuth2ClientManagerService.getMicrosoftOAuth2Client(
          connectedAccount,
        );

      const response = await microsoftClient
        .api('/me/mailFolders')
        .version('beta')
        .top(MESSAGING_MICROSOFT_MAIL_FOLDERS_LIST_MAX_RESULT)
        .get()
        .catch((error) => {
          this.logger.error(
            `Connected account ${connectedAccount.id}: Error fetching folders: ${error.message}`,
          );
          this.microsoftHandleErrorService.handleMicrosoftGetMessageListError(
            error,
          );

          return { value: [] };
        });

      const folders = (response.value as MicrosoftGraphFolder[]) || [];
      const folderInfos: MessageFolder[] = [];

      for (const folder of folders) {
        if (!folder.displayName) {
          continue;
        }

        const standardFolder = getStandardFolderByRegex(folder.displayName);
        const isSentFolder = this.isSentFolder(standardFolder);
        const isSynced = this.shouldSyncByDefault(standardFolder);

        folderInfos.push({
          externalId: folder.id,
          name: folder.displayName,
          isSynced,
          isSentFolder,
        });
      }

      this.logger.log(
        `Found ${folderInfos.length} folders for Microsoft account ${connectedAccount.handle}`,
      );

      return folderInfos;
    } catch (error) {
      this.logger.error(
        `Failed to get Microsoft folders for account ${connectedAccount.handle}:`,
        error,
      );

      throw error;
    }
  }

  private isSentFolder(standardFolder: StandardFolder | null): boolean {
    return standardFolder === StandardFolder.SENT;
  }

  private shouldSyncByDefault(standardFolder: StandardFolder | null): boolean {
    if (
      standardFolder === StandardFolder.JUNK ||
      standardFolder === StandardFolder.DRAFTS ||
      standardFolder === StandardFolder.TRASH
    ) {
      return false;
    }

    return true;
  }
}
