import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  Workspace,
  WorkspaceActivationStatus,
} from 'src/engine/core-modules/workspace/workspace.entity';
import { ExceptionHandlerService } from 'src/engine/integrations/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import {
  MessagingOngoingStaleJob,
  MessagingOngoingStaleJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-ongoing-stale.job';

@Processor(MessageQueue.cronQueue)
export class MessagingOngoingStaleCronJob {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(MessagingOngoingStaleCronJob.name)
  async handle(): Promise<void> {
    const activeWorkspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    });

    for (const activeWorkspace of activeWorkspaces) {
      try {
        await this.messageQueueService.add<MessagingOngoingStaleJobData>(
          MessagingOngoingStaleJob.name,
          {
            workspaceId: activeWorkspace.id,
          },
        );
      } catch (error) {
        this.exceptionHandlerService.captureExceptions([error], {
          user: {
            workspaceId: activeWorkspace.id,
          },
        });
      }
    }
  }
}
