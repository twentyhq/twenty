import { Injectable, Logger } from '@nestjs/common';

import { type Client } from '@microsoft/microsoft-graph-client';
import { isDefined } from 'twenty-shared/utils';

import {
  MessageFolder,
  MessageFolderDriver,
} from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MicrosoftClientProvider } from 'src/modules/messaging/message-import-manager/drivers/microsoft/providers/microsoft-client.provider';
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

      const microsoftGraphFolders = await this.fetchFoldersRecursively(
        microsoftClient,
        connectedAccount,
      );

      const messageFolders: MessageFolder[] = [];

      for (const microsoftGraphFolder of microsoftGraphFolders) {
        if (!microsoftGraphFolder.displayName) continue;

        const standardFolder = getStandardFolderByRegex(
          microsoftGraphFolder.displayName,
        );

        if (this.shouldExcludeFolder(standardFolder)) continue;

        const isInboxFolder = this.isInboxFolder(standardFolder);
        const isSentFolder = this.isSentFolder(standardFolder);

        messageFolders.push({
          externalId: microsoftGraphFolder.id,
          name: microsoftGraphFolder.displayName,
          isSynced: isInboxFolder || isSentFolder,
          isSentFolder,
        });
      }

      this.logger.log(
        `Found ${messageFolders.length} folders for Microsoft account ${connectedAccount.handle}`,
      );

      return messageFolders;
    } catch (error) {
      this.logger.error(
        `Failed to get Microsoft folders for account ${connectedAccount.handle}:`,
        error,
      );
      throw error;
    }
  }

  private async fetchFoldersRecursively(
    microsoftClient: Client,
    connectedAccount: Pick<ConnectedAccountWorkspaceEntity, 'id'>,
    parentFolderId: string | null = null,
  ): Promise<MicrosoftGraphFolder[]> {
    const endpoint = parentFolderId
      ? `/me/mailFolders/${parentFolderId}/childFolders`
      : '/me/mailFolders';

    const folders = await this.fetchFolderPage(
      microsoftClient,
      connectedAccount,
      endpoint,
    );

    const allFolders = [...folders];

    for (const folder of folders) {
      if ((folder.childFolderCount ?? 0) > 0) {
        const childFolders = await this.fetchFoldersRecursively(
          microsoftClient,
          connectedAccount,
          folder.id,
        );

        allFolders.push(...childFolders);
      }
    }

    return allFolders;
  }

  private async fetchFolderPage(
    microsoftClient: Client,
    connectedAccount: Pick<ConnectedAccountWorkspaceEntity, 'id'>,
    endpoint: string,
  ): Promise<MicrosoftGraphFolder[]> {
    const allFoldersFromEndpoint: MicrosoftGraphFolder[] = [];
    let nextPageUrl: string | undefined = endpoint;

    while (isDefined(nextPageUrl)) {
      try {
        const response = await microsoftClient
          .api(nextPageUrl)
          .top(MESSAGING_MICROSOFT_MAIL_FOLDERS_LIST_MAX_RESULT)
          .select('id,displayName,childFolderCount,parentFolderId')
          .get();

        const currentPageFolders =
          (response.value as MicrosoftGraphFolder[]) || [];

        allFoldersFromEndpoint.push(...currentPageFolders);

        nextPageUrl = response['@odata.nextLink'];
      } catch (error) {
        this.logger.error(
          `Connected account ${connectedAccount.id}: Error fetching folder page: ${error.message}`,
        );
        this.microsoftHandleErrorService.handleMicrosoftGetMessageListError(
          error,
        );
        break;
      }
    }

    return allFoldersFromEndpoint;
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
