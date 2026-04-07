import { Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { MessageChannelSyncStage } from 'twenty-shared/types';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { isThrottled } from 'src/modules/connected-account/utils/is-throttled';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { MessagingMessagesImportService } from 'src/modules/messaging/message-import-manager/services/messaging-messages-import.service';
import { MessagingMonitoringService } from 'src/modules/messaging/monitoring/services/messaging-monitoring.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

const toIsoStringOrNull = (
  value: string | Date | null | undefined,
): string | null => {
  if (value == null) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : value;
};

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
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
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

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageChannel = await this.messageChannelRepository.findOne({
        where: {
          id: messageChannelId,
          workspaceId,
        },
        relations: { connectedAccount: true, messageFolders: true },
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
          toIsoStringOrNull(messageChannel.syncStageStartedAt),
          messageChannel.throttleFailureCount,
          toIsoStringOrNull(messageChannel.throttleRetryAfter),
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
    }, authContext);
  }
}
