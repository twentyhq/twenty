import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { isThrottled } from 'src/modules/connected-account/utils/is-throttled';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import {
  MessageChannelSyncStage,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessagingMessagesImportService } from 'src/modules/messaging/message-import-manager/services/messaging-messages-import.service';
import { MessagingMonitoringService } from 'src/modules/messaging/monitoring/services/messaging-monitoring.service';

export type MessagingMessagesImportJobData = {
  messageChannelId: string;
  workspaceId: string;
};

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class MessagingMessagesImportJob {
  constructor(
    private readonly messagingMessagesImportService: MessagingMessagesImportService,
    private readonly messagingMonitoringService: MessagingMonitoringService,
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  @Process(MessagingMessagesImportJob.name)
  async handle(data: MessagingMessagesImportJobData): Promise<void> {
    const { messageChannelId, workspaceId } = data;

    await this.messagingMonitoringService.track({
      eventName: 'messages_import.triggered',
      workspaceId,
      messageChannelId,
    });

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
          where: {
            id: messageChannelId,
          },
          relations: ['connectedAccount'],
        });

        if (!messageChannel) {
          await this.messagingMonitoringService.track({
            eventName: 'messages_import.error.message_channel_not_found',
            messageChannelId,
            workspaceId,
          });

          return;
        }

        if (!messageChannel?.isSyncEnabled) {
          return;
        }

        if (
          messageChannel.syncStage !==
          MessageChannelSyncStage.MESSAGES_IMPORT_SCHEDULED
        ) {
          return;
        }

        if (
          isThrottled(
            messageChannel.syncStageStartedAt,
            messageChannel.throttleFailureCount,
          )
        ) {
          await this.messageChannelSyncStatusService.markAsMessagesImportPending(
            [messageChannel.id],
            workspaceId,
            true,
          );

          return;
        }

        await this.messagingMessagesImportService.processMessageBatchImport(
          messageChannel,
          messageChannel.connectedAccount,
          workspaceId,
        );
      },
    );
  }
}
