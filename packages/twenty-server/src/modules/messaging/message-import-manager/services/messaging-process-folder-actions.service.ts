import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessageFolderPendingSyncAction,
  MessageFolderWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { MessagingDeleteFolderMessagesService } from 'src/modules/messaging/message-import-manager/services/messaging-delete-folder-messages.service';

@Injectable()
export class MessagingProcessFolderActionsService {
  private readonly logger = new Logger(
    MessagingProcessFolderActionsService.name,
  );

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly messagingDeleteFolderMessagesService: MessagingDeleteFolderMessagesService,
  ) {}

  async processFolderActions(
    messageChannel: MessageChannelWorkspaceEntity,
    messageFolders: MessageFolderWorkspaceEntity[],
    workspaceId: string,
  ): Promise<void> {
    const foldersWithPendingActions = messageFolders.filter(
      (folder) =>
        isDefined(folder.pendingSyncAction) &&
        folder.pendingSyncAction !== MessageFolderPendingSyncAction.NONE,
    );

    if (foldersWithPendingActions.length === 0) {
      return;
    }

    this.logger.log(
      `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id} - Processing ${foldersWithPendingActions.length} folders with pending actions`,
    );

    const folderIdsToDelete: string[] = [];
    const processedFolderIds: string[] = [];
    const failedFolderIds: Array<{ folderId: string; error: Error }> = [];

    for (const folder of foldersWithPendingActions) {
      try {
        this.logger.log(
          `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id}, FolderId: ${folder.id} - Processing folder action: ${folder.pendingSyncAction}`,
        );

        if (
          folder.pendingSyncAction ===
          MessageFolderPendingSyncAction.FOLDER_DELETION
        ) {
          await this.messagingDeleteFolderMessagesService.deleteFolderMessages(
            workspaceId,
            messageChannel,
            folder,
          );

          folderIdsToDelete.push(folder.id);

          this.logger.log(
            `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id}, FolderId: ${folder.id} - Completed FOLDER_DELETION action`,
          );
        }

        processedFolderIds.push(folder.id);
      } catch (error) {
        this.logger.error(
          `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id}, FolderId: ${folder.id} - Error processing folder action: ${error.message}`,
          error.stack,
        );
        failedFolderIds.push({ folderId: folder.id, error });
      }
    }

    if (failedFolderIds.length > 0) {
      this.logger.warn(
        `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id} - Failed to process ${failedFolderIds.length} folders. They will be retried on next sync.`,
      );
    }

    if (processedFolderIds.length > 0 || folderIdsToDelete.length > 0) {
      const authContext = buildSystemAuthContext(workspaceId);

      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        authContext,
        async () => {
          const workspaceDataSource =
            await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

          await workspaceDataSource?.transaction(
            async (transactionManager: WorkspaceEntityManager) => {
              const messageFolderRepository =
                await this.globalWorkspaceOrmManager.getRepository<MessageFolderWorkspaceEntity>(
                  workspaceId,
                  'messageFolder',
                );

              if (processedFolderIds.length > 0) {
                await messageFolderRepository.update(
                  { id: In(processedFolderIds) },
                  { pendingSyncAction: MessageFolderPendingSyncAction.NONE },
                  transactionManager,
                );

                this.logger.log(
                  `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id} - Reset pendingSyncAction to NONE for ${processedFolderIds.length} folders`,
                );
              }

              if (folderIdsToDelete.length > 0) {
                await messageFolderRepository.delete(
                  { id: In(folderIdsToDelete) },
                  transactionManager,
                );

                this.logger.log(
                  `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id} - Deleted ${folderIdsToDelete.length} folders`,
                );
              }
            },
          );
        },
      );
    }
  }
}
