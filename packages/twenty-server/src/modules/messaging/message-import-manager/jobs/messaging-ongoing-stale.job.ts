import { Logger, Scope } from '@nestjs/common';

import { In } from 'typeorm';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import {
  MessageChannelSyncStage,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { isSyncStale } from 'src/modules/messaging/message-import-manager/utils/is-sync-stale.util';

export type MessagingOngoingStaleJobData = {
  workspaceId: string;
};

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class MessagingOngoingStaleJob {
  private readonly logger = new Logger(MessagingOngoingStaleJob.name);
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
  ) {}

  @Process(MessagingOngoingStaleJob.name)
  async handle(data: MessagingOngoingStaleJobData): Promise<void> {
    const { workspaceId } = data;

    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    const messageChannels = await messageChannelRepository.find({
      where: {
        syncStage: In([
          MessageChannelSyncStage.MESSAGES_IMPORT_ONGOING,
          MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING,
        ]),
      },
    });

    for (const messageChannel of messageChannels) {
      if (
        messageChannel.syncStageStartedAt &&
        isSyncStale(messageChannel.syncStageStartedAt)
      ) {
        this.logger.log(
          `Sync for message channel ${messageChannel.id} and workspace ${workspaceId} is stale. Setting sync stage to MESSAGES_IMPORT_PENDING`,
        );

        await this.messageChannelSyncStatusService.resetSyncStageStartedAt([
          messageChannel.id,
        ]);

        switch (messageChannel.syncStage) {
          case MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING:
            await this.messageChannelSyncStatusService.schedulePartialMessageListFetch(
              [messageChannel.id],
            );
            break;
          case MessageChannelSyncStage.MESSAGES_IMPORT_ONGOING:
            await this.messageChannelSyncStatusService.scheduleMessagesImport([
              messageChannel.id,
            ]);
            break;
          default:
            break;
        }
      }
    }
  }
}
