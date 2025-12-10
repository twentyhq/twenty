import { Scope } from '@nestjs/common';

import { Not } from 'typeorm';

import { type ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { type BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import {
  MessageChannelSyncStage,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

export type BlocklistReimportMessagesJobData = WorkspaceEventBatch<
  ObjectRecordDeleteEvent<BlocklistWorkspaceEntity>
>;

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class BlocklistReimportMessagesJob {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly messagingChannelSyncStatusService: MessageChannelSyncStatusService,
  ) {}

  @Process(BlocklistReimportMessagesJob.name)
  async handle(data: BlocklistReimportMessagesJobData): Promise<void> {
    const workspaceId = data.workspaceId;

    const messageChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelWorkspaceEntity>(
        workspaceId,
        'messageChannel',
      );

    for (const eventPayload of data.events) {
      const workspaceMemberId =
        eventPayload.properties.before.workspaceMemberId;

      const messageChannels = await messageChannelRepository.find({
        select: ['id'],
        where: {
          connectedAccount: {
            accountOwnerId: workspaceMemberId,
          },
          syncStage: Not(MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING),
        },
      });

      await this.messagingChannelSyncStatusService.resetAndMarkAsMessagesListFetchPending(
        messageChannels.map((messageChannel) => messageChannel.id),
        workspaceId,
      );
    }
  }
}
