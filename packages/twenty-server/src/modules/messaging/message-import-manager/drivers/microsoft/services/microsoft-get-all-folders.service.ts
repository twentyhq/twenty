import { Injectable, Logger } from '@nestjs/common';

import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { MicrosoftClientProvider } from 'src/modules/messaging/message-import-manager/drivers/microsoft/providers/microsoft-client.provider';
import { MicrosoftHandleErrorService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-handle-error.service';
import { StandardFolder } from 'src/modules/messaging/message-import-manager/drivers/types/standard-folder';
import { getStandardFolderByRegex } from 'src/modules/messaging/message-import-manager/drivers/utils/get-standard-folder-by-regex';

type MicrosoftGraphFolder = {
  id: string;
  displayName: string;
};

type MessageFolder = Pick<
  MessageFolderWorkspaceEntity,
  'name' | 'isSynced' | 'isSentFolder' | 'externalId'
>;

@Injectable()
export class MicrosoftGetAllFoldersService {
  private readonly logger = new Logger(MicrosoftGetAllFoldersService.name);

  constructor(
    private readonly microsoftClientProvider: MicrosoftClientProvider,
    private readonly microsoftHandleErrorService: MicrosoftHandleErrorService,
  ) {}

  async getAllMessageFolders(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'refreshToken' | 'id' | 'handle'
    >,
  ): Promise<MessageFolder[]> {
    try {
      const microsoftClient =
        await this.microsoftClientProvider.getMicrosoftClient(connectedAccount);

      const response = await microsoftClient
        .api('/me/mailFolders')
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

        if (this.shouldExcludeFolder(standardFolder)) {
          continue;
        }

        const isInbox = this.isInboxFolder(standardFolder);
        const isSentFolder = this.isSentFolder(standardFolder);

        folderInfos.push({
          externalId: folder.id,
          name: folder.displayName,
          isSynced: isInbox || isSentFolder,
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

  private isInboxFolder(standardFolder: StandardFolder | null): boolean {
    return standardFolder === StandardFolder.INBOX;
  }

  private isSentFolder(standardFolder: StandardFolder | null): boolean {
    return standardFolder === StandardFolder.SENT;
  }

  private shouldExcludeFolder(standardFolder: StandardFolder | null): boolean {
    return (
      standardFolder !== null &&
      standardFolder !== StandardFolder.SENT &&
      standardFolder !== StandardFolder.INBOX
    );
  }
}
