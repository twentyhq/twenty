import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import deepEqual from 'deep-equal';
import { ConnectedAccountProvider } from 'twenty-shared/types';

import {
  DiscoveredMessageFolder,
  MessageFolder,
} from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessageFolderPendingSyncAction,
  MessageFolderWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { GmailGetAllFoldersService } from 'src/modules/messaging/message-folder-manager/drivers/gmail/services/gmail-get-all-folders.service';
import { ImapGetAllFoldersService } from 'src/modules/messaging/message-folder-manager/drivers/imap/services/imap-get-all-folders.service';
import { MicrosoftGetAllFoldersService } from 'src/modules/messaging/message-folder-manager/drivers/microsoft/services/microsoft-get-all-folders.service';

@Injectable()
export class SyncMessageFoldersService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly gmailGetAllFoldersService: GmailGetAllFoldersService,
    private readonly microsoftGetAllFoldersService: MicrosoftGetAllFoldersService,
    private readonly imapGetAllFoldersService: ImapGetAllFoldersService,
  ) {}

  async syncMessageFolders(
    messageChannel: MessageChannelWorkspaceEntity,
    workspaceId: string,
  ): Promise<MessageFolder[]> {
    const discoveredFolders = await this.discoverAllFolders(
      messageChannel.connectedAccount,
      messageChannel,
    );

    const { messageFolders: existingFolders, id: messageChannelId } =
      messageChannel;

    return this.syncFolderChanges(
      discoveredFolders,
      existingFolders,
      messageChannelId,
      workspaceId,
    );
  }

  async discoverAllFolders(
    connectedAccount: MessageChannelWorkspaceEntity['connectedAccount'],
    messageChannel: Pick<
      MessageChannelWorkspaceEntity,
      'messageFolderImportPolicy'
    >,
  ): Promise<DiscoveredMessageFolder[]> {
    switch (connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE:
        return this.gmailGetAllFoldersService.getAllMessageFolders(
          connectedAccount,
          messageChannel,
        );
      case ConnectedAccountProvider.MICROSOFT:
        return this.microsoftGetAllFoldersService.getAllMessageFolders(
          connectedAccount,
          messageChannel,
        );
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
        return this.imapGetAllFoldersService.getAllMessageFolders(
          connectedAccount,
          messageChannel,
        );
      default:
        throw new Error(
          `Provider ${connectedAccount.provider} is not supported`,
        );
    }
  }

  private async syncFolderChanges(
    discoveredFolders: DiscoveredMessageFolder[],
    existingFolders: MessageFolder[],
    messageChannelId: string,
    workspaceId: string,
  ): Promise<MessageFolder[]> {
    const existingFoldersByExternalId = new Map(
      existingFolders.map((folder) => [folder.externalId, folder]),
    );

    const foldersToCreate: Partial<MessageFolderWorkspaceEntity>[] = [];
    const foldersToUpdate = new Map<
      string,
      Partial<MessageFolderWorkspaceEntity>
    >();

    for (const discoveredFolder of discoveredFolders) {
      const existingFolder = existingFoldersByExternalId.get(
        discoveredFolder.externalId,
      );

      if (!existingFolder) {
        foldersToCreate.push({
          name: discoveredFolder.name,
          externalId: discoveredFolder.externalId,
          messageChannelId,
          isSentFolder: discoveredFolder.isSentFolder,
          isSynced: discoveredFolder.isSynced,
          syncCursor: null,
          parentFolderId: isNonEmptyString(discoveredFolder.parentFolderId)
            ? discoveredFolder.parentFolderId
            : null,
        });
        continue;
      }

      const discoveredFolderData = {
        name: discoveredFolder.name,
        isSentFolder: discoveredFolder.isSentFolder,
        parentFolderId: isNonEmptyString(discoveredFolder.parentFolderId)
          ? discoveredFolder.parentFolderId
          : null,
      };

      const existingFolderData = {
        name: existingFolder.name,
        isSentFolder: existingFolder.isSentFolder,
        parentFolderId: isNonEmptyString(existingFolder.parentFolderId)
          ? existingFolder.parentFolderId
          : null,
      };

      if (!deepEqual(discoveredFolderData, existingFolderData)) {
        foldersToUpdate.set(existingFolder.id, discoveredFolderData);
      }
    }

    const discoveredExternalIds = new Set(
      discoveredFolders.map((discoveredFolder) => discoveredFolder.externalId),
    );

    const folderIdsToDelete = existingFolders
      .filter(
        (existingFolder) =>
          !discoveredExternalIds.has(existingFolder.externalId),
      )
      .map((existingFolder) => existingFolder.id);

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const messageFolderRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageFolderWorkspaceEntity>(
            workspaceId,
            'messageFolder',
          );

        const workspaceDataSource =
          await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

        return workspaceDataSource.transaction(
          async (transactionManager: WorkspaceEntityManager) => {
            if (folderIdsToDelete.length > 0) {
              await messageFolderRepository.updateMany(
                folderIdsToDelete.map((id) => ({
                  criteria: id,
                  partialEntity: {
                    pendingSyncAction:
                      MessageFolderPendingSyncAction.FOLDER_DELETION,
                  },
                })),
                transactionManager,
              );
            }

            if (foldersToUpdate.size > 0) {
              await messageFolderRepository.updateMany(
                Array.from(foldersToUpdate.entries()).map(([id, data]) => ({
                  criteria: id,
                  partialEntity: data,
                })),
                transactionManager,
              );
            }

            const createdFolders =
              foldersToCreate.length > 0
                ? await messageFolderRepository.save(
                    foldersToCreate,
                    {},
                    transactionManager,
                  )
                : [];

            const updatedExistingFolders = this.computeUpdatedFolders(
              existingFolders,
              foldersToUpdate,
              folderIdsToDelete,
            );

            return [...updatedExistingFolders, ...createdFolders];
          },
        );
      },
    );
  }

  private computeUpdatedFolders(
    existingFolders: MessageFolder[],
    foldersToUpdate: Map<string, Partial<MessageFolderWorkspaceEntity>>,
    folderIdsToDelete: string[],
  ): MessageFolder[] {
    return existingFolders.map((existingFolder) => {
      const update = foldersToUpdate.get(existingFolder.id);
      const isMarkedForDeletion = folderIdsToDelete.includes(existingFolder.id);

      const pendingSyncAction = isMarkedForDeletion
        ? MessageFolderPendingSyncAction.FOLDER_DELETION
        : MessageFolderPendingSyncAction.NONE;

      if (update) {
        return {
          ...existingFolder,
          ...update,
          pendingSyncAction,
        };
      }

      return {
        ...existingFolder,
        pendingSyncAction,
      };
    });
  }
}
