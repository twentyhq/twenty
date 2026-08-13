import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Brackets, Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MESSAGING_IMPORT_ONGOING_SYNC_TIMEOUT } from 'src/modules/messaging/message-import-manager/constants/messaging-import-ongoing-sync-timeout.constant';
import { MESSAGING_ONGOING_STALE_SYNC_STAGES } from 'src/modules/messaging/message-import-manager/constants/messaging-ongoing-stale-sync-stages.constant';
import { MESSAGING_PENDING_STALE_SYNC_STAGES } from 'src/modules/messaging/message-import-manager/constants/messaging-pending-stale-sync-stages.constant';
import {
  MessagingOngoingStaleJob,
  type MessagingOngoingStaleJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-ongoing-stale.job';

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

    // Ongoing/scheduled stages are stale if they've run past the timeout, or
    // if syncStageStartedAt was never set (shouldn't normally happen for
    // these stages, but treat it as stale rather than silently skip it).
    // Pending stages are different: syncStageStartedAt is null while a
    // channel is healthily waiting for the next fast cron tick, so a
    // pending channel is only stale once it carries a real, old timestamp
    // (which only happens via the throttle-recovery path) — see
    // isPendingSyncStale for the matching per-channel check.
    const staleChannels = await this.messageChannelRepository
      .createQueryBuilder('messageChannel')
      .select('messageChannel.workspaceId', 'workspaceId')
      .innerJoin('messageChannel.workspace', 'workspace')
      .where('workspace.deletedAt IS NULL')
      .andWhere('workspace.activationStatus = :activationStatus', {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      })
      .andWhere(
        new Brackets((queryBuilder) => {
          queryBuilder
            .where(
              'messageChannel.syncStage IN (:...ongoingStages) AND (messageChannel.syncStageStartedAt IS NULL OR messageChannel.syncStageStartedAt < :staleBefore)',
              {
                ongoingStages: MESSAGING_ONGOING_STALE_SYNC_STAGES,
                staleBefore,
              },
            )
            .orWhere(
              'messageChannel.syncStage IN (:...pendingStages) AND messageChannel.syncStageStartedAt < :staleBefore',
              {
                pendingStages: MESSAGING_PENDING_STALE_SYNC_STAGES,
                staleBefore,
              },
            );
        }),
      )
      .getRawMany<{ workspaceId: string }>();

    return [...new Set(staleChannels.map(({ workspaceId }) => workspaceId))];
  }
}
