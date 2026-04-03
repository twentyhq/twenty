import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { EntityManager } from 'typeorm';

import { MessageChannelPendingGroupEmailsAction } from 'twenty-shared/types';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessagingDeleteGroupEmailMessagesService } from 'src/modules/messaging/message-import-manager/services/messaging-delete-group-email-messages.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

@Injectable()
export class MessagingProcessGroupEmailActionsService {
  private readonly logger = new Logger(
    MessagingProcessGroupEmailActionsService.name,
  );

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly messagingDeleteGroupEmailMessagesService: MessagingDeleteGroupEmailMessagesService,
  ) {}

  async markMessageChannelAsPendingGroupEmailsAction(
    messageChannel: MessageChannelEntity,
    workspaceId: string,
    pendingGroupEmailsAction: MessageChannelPendingGroupEmailsAction,
  ): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const workspaceDataSource =
        await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

      await workspaceDataSource
        .getRepository(MessageChannelEntity)
        .update(
          { id: messageChannel.id, workspaceId },
          { pendingGroupEmailsAction },
        );
    }, authContext);

    this.logger.debug(
      `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id} - Marked message channel as pending group emails action: ${pendingGroupEmailsAction}`,
    );
  }

  async processGroupEmailActions(
    messageChannel: MessageChannelEntity,
    workspaceId: string,
  ): Promise<void> {
    const { pendingGroupEmailsAction } = messageChannel;

    if (
      !isDefined(pendingGroupEmailsAction) ||
      pendingGroupEmailsAction === MessageChannelPendingGroupEmailsAction.NONE
    ) {
      return;
    }

    this.logger.debug(
      `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id} - Processing group email action: ${pendingGroupEmailsAction}`,
    );

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const workspaceDataSource =
        await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

      await workspaceDataSource?.transaction(
        async (transactionManager: EntityManager) => {
          try {
            switch (pendingGroupEmailsAction) {
              case MessageChannelPendingGroupEmailsAction.GROUP_EMAILS_DELETION:
                await this.handleGroupEmailsDeletion(
                  workspaceId,
                  messageChannel.id,
                  transactionManager,
                );
                break;
              case MessageChannelPendingGroupEmailsAction.GROUP_EMAILS_IMPORT:
                await this.handleGroupEmailsImport(
                  workspaceId,
                  messageChannel.id,
                  transactionManager,
                );
                break;
            }

            await transactionManager.getRepository(MessageChannelEntity).update(
              { id: messageChannel.id, workspaceId },
              {
                pendingGroupEmailsAction:
                  MessageChannelPendingGroupEmailsAction.NONE,
              },
            );

            this.logger.debug(
              `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id} - Reset pendingGroupEmailsAction to NONE`,
            );
          } catch (error) {
            this.logger.error(
              `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id} - Error processing group email action: ${error.message}`,
              (error as Error).stack,
            );
            throw error;
          }
        },
      );
    }, authContext);
  }

  private async handleGroupEmailsDeletion(
    workspaceId: string,
    messageChannelId: string,
    transactionManager: EntityManager,
  ): Promise<void> {
    await this.messagingDeleteGroupEmailMessagesService.deleteGroupEmailMessages(
      workspaceId,
      messageChannelId,
    );

    await this.resetCursors(workspaceId, messageChannelId, transactionManager);

    this.logger.debug(
      `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannelId} - Completed GROUP_EMAILS_DELETION action`,
    );
  }

  private async handleGroupEmailsImport(
    workspaceId: string,
    messageChannelId: string,
    transactionManager: EntityManager,
  ): Promise<void> {
    await this.resetCursors(workspaceId, messageChannelId, transactionManager);

    this.logger.debug(
      `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannelId} - Completed GROUP_EMAILS_IMPORT action`,
    );
  }

  private async resetCursors(
    workspaceId: string,
    messageChannelId: string,
    transactionManager: EntityManager,
  ) {
    await transactionManager
      .getRepository(MessageChannelEntity)
      .update({ id: messageChannelId, workspaceId }, { syncCursor: '' });

    await transactionManager
      .getRepository(MessageFolderEntity)
      .update({ messageChannelId, workspaceId }, { syncCursor: '' });
  }
}
