import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  MessageFolder,
  MessageFolderDriver,
} from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MicrosoftMessageListFetchErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-message-list-fetch-error-handler.service';
import { StandardFolder } from 'src/modules/messaging/message-import-manager/drivers/types/standard-folder';

type MicrosoftGraphFolder = {
  id: string;
  displayName: string;
  childFolderCount?: number;
  parentFolderId?: string;
  wellKnownName?: string;
};

const MESSAGING_MICROSOFT_MAIL_FOLDERS_LIST_MAX_RESULT = 999;

@Injectable()
export class MicrosoftGetAllFoldersService implements MessageFolderDriver {
  private readonly logger = new Logger(MicrosoftGetAllFoldersService.name);

  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
    private readonly microsoftMessageListFetchErrorHandler: MicrosoftMessageListFetchErrorHandler,
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
          this.microsoftMessageListFetchErrorHandler.handleError(error);

          return { value: [] };
        });

      const folders = (response.value as MicrosoftGraphFolder[]) || [];
      const rootFolderId = this.getRootFolderId(folders);
      const folderInfos: MessageFolder[] = [];

      for (const folder of folders) {
        if (!folder.displayName) {
          continue;
        }

        const standardFolder = this.getStandardFolderFromWellKnownName(
          folder.wellKnownName,
        );
        const isSentFolder = this.isSentFolder(standardFolder);
        const isSynced = this.shouldSyncByDefault(standardFolder);

        folderInfos.push({
          externalId: folder.id,
          name: folder.displayName,
          isSynced,
          isSentFolder,
          parentFolderId: this.getParentFolderId(
            folder.parentFolderId,
            rootFolderId,
          ),
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

  private getStandardFolderFromWellKnownName(
    wellKnownName?: string,
  ): StandardFolder | null {
    if (!isDefined(wellKnownName)) {
      return null;
    }

    switch (wellKnownName.toLowerCase()) {
      case 'inbox':
        return StandardFolder.INBOX;
      case 'drafts':
        return StandardFolder.DRAFTS;
      case 'sentitems':
        return StandardFolder.SENT;
      case 'deleteditems':
        return StandardFolder.TRASH;
      case 'junkemail':
        return StandardFolder.JUNK;
      default:
        return null;
    }
  }

  /*
   * All Microsoft folders have a parentFolderId including the standard folders
   * which point to root node which doesn't exits in the API response.
   * We remove this to simplify the folder hierarchy on frontend.
   */
  private getRootFolderId(folders: MicrosoftGraphFolder[]): string | null {
    for (const folder of folders) {
      if (isDefined(folder.wellKnownName) && isDefined(folder.parentFolderId)) {
        return folder.parentFolderId;
      }
    }

    return null;
  }

  private getParentFolderId(
    parentFolderId: string | undefined,
    rootFolderId: string | null,
  ): string | null {
    if (!isDefined(parentFolderId)) {
      return null;
    }

    if (parentFolderId === rootFolderId) {
      return null;
    }

    return parentFolderId;
  }
}
