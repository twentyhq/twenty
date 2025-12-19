import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import {
  DiscoveredMessageFolder,
  MessageFolder,
} from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessageFolderPendingSyncAction,
  MessageFolderWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { GmailGetAllFoldersService } from 'src/modules/messaging/message-folder-manager/drivers/gmail/services/gmail-get-all-folders.service';
import { ImapGetAllFoldersService } from 'src/modules/messaging/message-folder-manager/drivers/imap/services/imap-get-all-folders.service';
import { MicrosoftGetAllFoldersService } from 'src/modules/messaging/message-folder-manager/drivers/microsoft/services/microsoft-get-all-folders.service';
import { computeFolderIdsToDelete } from 'src/modules/messaging/message-folder-manager/utils/compute-folder-ids-to-delete.util';
import { computeFoldersToCreate } from 'src/modules/messaging/message-folder-manager/utils/compute-folders-to-create.util';
import { computeFoldersToUpdate } from 'src/modules/messaging/message-folder-manager/utils/compute-folders-to-update.util';
import { computeUpdatedFolders } from 'src/modules/messaging/message-folder-manager/utils/compute-updated-folders.util';

@Injectable()
export class SyncMessageFoldersService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly gmailGetAllFoldersService: GmailGetAllFoldersService,
    private readonly microsoftGetAllFoldersService: MicrosoftGetAllFoldersService,
    private readonly imapGetAllFoldersService: ImapGetAllFoldersService,
  ) {}

  async syncMessageFolders({
    messageChannel,
    workspaceId,
  }: {
    messageChannel: Pick<
      MessageChannelWorkspaceEntity,
      'id' | 'messageFolderImportPolicy'
    > & {
      connectedAccount: Pick<
        ConnectedAccountWorkspaceEntity,
        | 'provider'
        | 'accessToken'
        | 'refreshToken'
        | 'id'
        | 'handle'
        | 'connectionParameters'
      >;
      messageFolders: MessageFolder[];
    };
    workspaceId: string;
  }): Promise<MessageFolder[]> {
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
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      | 'accessToken'
      | 'refreshToken'
      | 'id'
      | 'handle'
      | 'provider'
      | 'connectionParameters'
    >,
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
    const foldersToCreate = computeFoldersToCreate({
      discoveredFolders,
      existingFolders,
      messageChannelId,
    });

    const foldersToUpdate = computeFoldersToUpdate({
      discoveredFolders,
      existingFolders,
    });

    const folderIdsToDelete = computeFolderIdsToDelete({
      discoveredFolders,
      existingFolders,
    });

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

            const updatedExistingFolders = computeUpdatedFolders({
              existingFolders,
              foldersToUpdate,
              folderIdsToDelete,
            });

            return [...updatedExistingFolders, ...createdFolders];
          },
        );
      },
    );
  }
}
