import { Logger, Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  MessageFolderImportPolicy,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessagingFolderRetroactiveImportService } from 'src/modules/messaging/message-import-manager/services/messaging-folder-retroactive-import.service';

export type MessagingFolderRetroactiveImportJobData = {
  workspaceId: string;
  messageChannelId: string;
  messageFolderId: string;
  folderExternalId: string | null;
};

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class MessagingFolderRetroactiveImportJob {
  private readonly logger = new Logger(
    MessagingFolderRetroactiveImportJob.name,
  );

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly messagingFolderRetroactiveImportService: MessagingFolderRetroactiveImportService,
  ) {}

  @Process(MessagingFolderRetroactiveImportJob.name)
  async handle(data: MessagingFolderRetroactiveImportJobData): Promise<void> {
    const { workspaceId, messageChannelId, messageFolderId, folderExternalId } =
      data;

    this.logger.log(
      `[START] Processing retroactive import for folder ${folderExternalId} in message channel ${messageChannelId} (workspace: ${workspaceId})`,
    );

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const messageChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
            workspaceId,
            'messageChannel',
          );

        const messageChannel = await messageChannelRepository.findOne({
          where: { id: messageChannelId },
          relations: ['connectedAccount'],
        });

        if (!messageChannel) {
          this.logger.warn(
            `Message channel ${messageChannelId} not found, skipping retroactive import`,
          );

          return;
        }

        if (!messageChannel.isSyncEnabled) {
          this.logger.log(
            `Sync is disabled for message channel ${messageChannelId}, skipping retroactive import`,
          );

          return;
        }

        // Log the current policy for debugging
        this.logger.log(
          `Message channel ${messageChannelId} has import policy: ${messageChannel.messageFolderImportPolicy}`,
        );

        // Only run retroactive import for SELECTED_FOLDERS policy
        if (
          messageChannel.messageFolderImportPolicy !==
          MessageFolderImportPolicy.SELECTED_FOLDERS
        ) {
          this.logger.warn(
            `Message channel ${messageChannelId} uses ${messageChannel.messageFolderImportPolicy} policy, skipping retroactive import. Change to SELECTED_FOLDERS to enable folder import.`,
          );

          return;
        }

        await this.messagingFolderRetroactiveImportService.processRetroactiveImport(
          {
            workspaceId,
            messageChannelId,
            messageFolderId,
            folderExternalId,
            connectedAccount: messageChannel.connectedAccount,
          },
        );

        this.logger.log(
          `[DONE] Completed retroactive import processing for folder ${folderExternalId}`,
        );
      },
    );
  }
}
