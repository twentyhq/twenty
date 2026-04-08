import { Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
} from 'twenty-shared/types';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

export type MessagingRelaunchFailedMessageChannelJobData = {
  workspaceId: string;
  messageChannelId: string;
};

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class MessagingRelaunchFailedMessageChannelJob {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
  ) {}

  @Process(MessagingRelaunchFailedMessageChannelJob.name)
  async handle(data: MessagingRelaunchFailedMessageChannelJobData) {
    const { workspaceId, messageChannelId } = data;

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageChannel = await this.messageChannelRepository.findOne({
        where: {
          id: messageChannelId,
          workspaceId,
        },
      });

      if (
        !messageChannel ||
        messageChannel.syncStage !== MessageChannelSyncStage.FAILED ||
        messageChannel.syncStatus !== MessageChannelSyncStatus.FAILED_UNKNOWN
      ) {
        return;
      }

      await this.messageChannelRepository.update(
        { id: messageChannelId, workspaceId },
        {
          syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
          syncStatus: MessageChannelSyncStatus.ACTIVE,
          throttleFailureCount: 0,
          throttleRetryAfter: null,
          syncStageStartedAt: null,
        },
      );
    }, authContext);
  }
}
