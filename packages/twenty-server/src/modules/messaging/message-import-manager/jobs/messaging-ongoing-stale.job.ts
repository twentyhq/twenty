import { Logger, Scope } from '@nestjs/common';

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
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: WorkspaceRepository<MessageChannelWorkspaceEntity>,
  ) {}

  @Process(MessagingOngoingStaleJob.name)
  async handle(data: MessagingOngoingStaleJobData): Promise<void> {
    const messageChannels = await this.messageChannelRepository.find({
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
          `Sync for message channel ${messageChannel.id} and workspace ${data.workspaceId} is stale. Setting sync stage to MESSAGES_IMPORT_PENDING`,
        );

        switch (messageChannel.syncStage) {
          case MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING:
            await this.messageChannelRepository.update(messageChannel.id, {
              syncStage:
                MessageChannelSyncStage.PARTIAL_MESSAGE_LIST_FETCH_PENDING,
            });
            break;
          case MessageChannelSyncStage.MESSAGES_IMPORT_ONGOING:
            await this.messageChannelRepository.update(messageChannel.id, {
              syncStage: MessageChannelSyncStage.MESSAGES_IMPORT_PENDING,
            });
            break;
          default:
            break;
        }
      }
    }
  }
}
