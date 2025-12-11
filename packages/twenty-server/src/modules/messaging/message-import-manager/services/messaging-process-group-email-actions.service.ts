import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  MessageChannelPendingGroupEmailsAction,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { MessagingDeleteGroupEmailMessagesService } from 'src/modules/messaging/message-import-manager/services/messaging-delete-group-email-messages.service';

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
    messageChannel: MessageChannelWorkspaceEntity,
    workspaceId: string,
    pendingGroupEmailsAction: MessageChannelPendingGroupEmailsAction,
  ): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const messageChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
            workspaceId,
            'messageChannel',
          );

        await messageChannelRepository.update(
          { id: messageChannel.id },
          { pendingGroupEmailsAction },
        );

        this.logger.log(
          `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id} - Marked message channel as pending group emails action: ${pendingGroupEmailsAction}`,
        );
      },
    );
  }

  async processGroupEmailActions(
    messageChannel: MessageChannelWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    const { pendingGroupEmailsAction } = messageChannel;

    if (
      !isDefined(pendingGroupEmailsAction) ||
      pendingGroupEmailsAction === MessageChannelPendingGroupEmailsAction.NONE
    ) {
      return;
    }

    this.logger.log(
      `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id} - Processing group email action: ${pendingGroupEmailsAction}`,
    );

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const workspaceDataSource =
          await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

        await workspaceDataSource?.transaction(
          async (transactionManager: WorkspaceEntityManager) => {
            try {
              const messageChannelRepository =
                await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
                  workspaceId,
                  'messageChannel',
                );

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

              await messageChannelRepository.update(
                { id: messageChannel.id },
                {
                  pendingGroupEmailsAction:
                    MessageChannelPendingGroupEmailsAction.NONE,
                },
                transactionManager,
              );

              this.logger.log(
                `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id} - Reset pendingGroupEmailsAction to NONE`,
              );
            } catch (error) {
              this.logger.error(
                `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id} - Error processing group email action: ${error.message}`,
                error.stack,
              );
              throw error;
            }
          },
        );
      },
    );
  }

  private async handleGroupEmailsDeletion(
    workspaceId: string,
    messageChannelId: string,
    transactionManager: WorkspaceEntityManager,
  ): Promise<void> {
    await this.messagingDeleteGroupEmailMessagesService.deleteGroupEmailMessages(
      workspaceId,
      messageChannelId,
    );

    await this.resetCursors({
      workspaceId,
      messageChannelId,
      transactionManager,
    });

    this.logger.log(
      `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannelId} - Completed GROUP_EMAILS_DELETION action`,
    );
  }

  private async handleGroupEmailsImport(
    workspaceId: string,
    messageChannelId: string,
    transactionManager: WorkspaceEntityManager,
  ): Promise<void> {
    await this.resetCursors({
      workspaceId,
      messageChannelId,
      transactionManager,
    });

    this.logger.log(
      `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannelId} - Completed GROUP_EMAILS_IMPORT action`,
    );
  }

  private async resetCursors({
    workspaceId,
    messageChannelId,
    transactionManager,
  }: {
    workspaceId: string;
    messageChannelId: string;
    transactionManager: WorkspaceEntityManager;
  }) {
    const messageChannelRepository =
      await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
        workspaceId,
        'messageChannel',
      );

    await messageChannelRepository.update(
      messageChannelId,
      {
        syncCursor: '',
      },
      transactionManager,
    );

    const messageFolderRepository =
      await this.globalWorkspaceOrmManager.getRepository<MessageFolderWorkspaceEntity>(
        workspaceId,
        'messageFolder',
      );

    await messageFolderRepository.update(
      { messageChannelId },
      { syncCursor: '' },
      transactionManager,
    );
  }
}
