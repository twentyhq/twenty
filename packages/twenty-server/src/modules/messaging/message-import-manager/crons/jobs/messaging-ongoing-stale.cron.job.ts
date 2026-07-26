import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In, IsNull, LessThan, Or, Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import {
  MESSAGING_ONGOING_STALE_SYNC_STAGES,
  MessagingOngoingStaleJob,
  type MessagingOngoingStaleJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-ongoing-stale.job';
import { MESSAGING_IMPORT_ONGOING_SYNC_TIMEOUT } from 'src/modules/messaging/message-import-manager/constants/messaging-import-ongoing-sync-timeout.constant';

export const MESSAGING_ONGOING_STALE_CRON_PATTERN = '0 * * * *';

@Processor(MessageQueue.cronQueue)
export class MessagingOngoingStaleCronJob {
  constructor(
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(MessagingOngoingStaleCronJob.name)
  @SentryCronMonitor(
    MessagingOngoingStaleCronJob.name,
    MESSAGING_ONGOING_STALE_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const staleWorkspaceIds = await this.findStaleWorkspaceIds();

    for (const workspaceId of staleWorkspaceIds) {
      try {
        await this.messageQueueService.add<MessagingOngoingStaleJobData>(
          MessagingOngoingStaleJob.name,
          {
            workspaceId,
          },
        );
      } catch (error) {
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: {
            id: workspaceId,
          },
        });
      }
    }
  }

  private async findStaleWorkspaceIds(): Promise<string[]> {
    const staleBefore = new Date(
      Date.now() - MESSAGING_IMPORT_ONGOING_SYNC_TIMEOUT,
    );
    const staleChannels = await this.messageChannelRepository.find({
      select: {
        workspaceId: true,
      },
      where: {
        syncStage: In(MESSAGING_ONGOING_STALE_SYNC_STAGES),
        syncStageStartedAt: Or(IsNull(), LessThan(staleBefore)),
        workspace: {
          deletedAt: IsNull(),
          activationStatus: WorkspaceActivationStatus.ACTIVE,
        },
      },
    });

    return [...new Set(staleChannels.map(({ workspaceId }) => workspaceId))];
  }
}
