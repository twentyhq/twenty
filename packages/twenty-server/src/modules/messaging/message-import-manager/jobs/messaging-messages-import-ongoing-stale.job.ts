import { Scope } from '@nestjs/common';

import { In } from 'typeorm';

import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import {
  MessageChannelSyncStage,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { isSyncStale } from 'src/modules/messaging/message-import-manager/utils/is-sync-stale.util';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';

export type MessagingMessagesImportOngoingStaleJobData = {
  workspaceId: string;
};

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class MessagingMessagesImportOngoingStaleJob {
  constructor(
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: WorkspaceRepository<MessageChannelWorkspaceEntity>,
  ) {}

  @Process(MessagingMessagesImportOngoingStaleJob.name)
  async handle(): Promise<void> {
    const messageChannels = await this.messageChannelRepository.find({
      where: {
        syncStage: In([MessageChannelSyncStage.MESSAGES_IMPORT_ONGOING]),
      },
    });

    for (const messageChannel of messageChannels) {
      if (
        messageChannel.syncStageStartedAt &&
        isSyncStale(messageChannel.syncStageStartedAt)
      ) {
        await this.messageChannelRepository.update(messageChannel.id, {
          syncStage: MessageChannelSyncStage.MESSAGES_IMPORT_PENDING,
        });
      }
    }
  }
}
