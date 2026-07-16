import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { FeatureFlagKey } from 'twenty-shared/types';
import { EXECUTIVE_SYNC_OUTBOX_REDRIVE_CRON_PATTERN } from 'src/modules/executive-search/sync/jobs/executive-sync-outbox-redrive.cron.pattern';
import { ExecutiveSyncProcessOutboxJob } from 'src/modules/executive-search/sync/jobs/executive-sync-process-outbox.job';
import { ExecutiveSearchOutboxService } from 'src/modules/executive-search/sync/services/outbox.service';

export const EXECUTIVE_SYNC_OUTBOX_REDRIVE_JOB_NAME = 'ExecutiveSearchOutboxRedriveJob';

@Processor(MessageQueue.cronQueue)
export class ExecutiveSearchOutboxRedriveJob {
  private readonly logger = new Logger(ExecutiveSearchOutboxRedriveJob.name);

  constructor(
    private readonly outboxService: ExecutiveSearchOutboxService,
    private readonly featureFlagService: FeatureFlagService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectMessageQueue(MessageQueue.executiveSyncQueue)
    private readonly executiveSyncQueue: MessageQueueService,
  ) {}

  @Process(EXECUTIVE_SYNC_OUTBOX_REDRIVE_JOB_NAME)
  @SentryCronMonitor(
    EXECUTIVE_SYNC_OUTBOX_REDRIVE_JOB_NAME,
    EXECUTIVE_SYNC_OUTBOX_REDRIVE_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const workspaces = await this.workspaceRepository.find({
      select: ['id'],
    });

    for (const workspace of workspaces) {
      try {
        if (
          !(await this.featureFlagService.isFeatureEnabled(
            FeatureFlagKey.IS_EXECUTIVE_SEARCH_OUTBOUND_PUBLISH_ENABLED,
            workspace.id,
          ))
        ) {
          continue;
        }

        // Re-enqueue PENDING entries ready for retry
        const readyEntries = await this.outboxService.findReadyForRetry(
          workspace.id,
          100,
        );

        for (const entry of readyEntries) {
          await this.executiveSyncQueue.add(
            ExecutiveSyncProcessOutboxJob.name,
            { workspaceId: workspace.id, outboxId: entry.id },
          );
        }

        // Re-enqueue stale PROCESSING entries (worker crash recovery)
        const staleEntries = await this.outboxService.findStaleProcessing(
          workspace.id,
          100,
        );

        for (const entry of staleEntries) {
          // Reset to PENDING so deliver()'s atomic claim can pick it up
          await this.outboxService.resetStaleToPending(
            workspace.id,
            entry.id,
          );
          await this.executiveSyncQueue.add(
            ExecutiveSyncProcessOutboxJob.name,
            { workspaceId: workspace.id, outboxId: entry.id },
          );
        }

        if (readyEntries.length > 0 || staleEntries.length > 0) {
          this.logger.log(
            `Redrived ${readyEntries.length} PENDING + ${staleEntries.length} stale PROCESSING entries for workspace ${workspace.id}`,
          );
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unknown error';
        this.logger.error(
          `Failed to redrive outbox for workspace ${workspace.id}: ${message}`,
        );
      }
    }
  }
}
