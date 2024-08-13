import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  Workspace,
  WorkspaceActivationStatus,
} from 'src/engine/core-modules/workspace/workspace.entity';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { MessageChannelRepository } from 'src/modules/messaging/common/repositories/message-channel.repository';
import {
  MessageChannelSyncStage,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessagingMessagesImportJob,
  MessagingMessagesImportJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-messages-import.job';

@Processor(MessageQueue.cronQueue)
export class MessagingMessagesImportCronJob {
  private readonly logger = new Logger(MessagingMessagesImportCronJob.name);

  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: MessageChannelRepository,
  ) {}

  @Process(MessagingMessagesImportCronJob.name)
  async handle(): Promise<void> {
    const activeWorkspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    });

    for (const activeWorkspace of activeWorkspaces) {
      const messageChannels = await this.messageChannelRepository.getAll(
        activeWorkspace.id,
      );

      for (const messageChannel of messageChannels) {
        if (
          messageChannel.isSyncEnabled &&
          messageChannel.syncStage ===
            MessageChannelSyncStage.MESSAGES_IMPORT_PENDING
        ) {
          await this.messageQueueService.add<MessagingMessagesImportJobData>(
            MessagingMessagesImportJob.name,
            {
              workspaceId: activeWorkspace.id,
              messageChannelId: messageChannel.id,
            },
          );
        }
      }
    }
  }
}
