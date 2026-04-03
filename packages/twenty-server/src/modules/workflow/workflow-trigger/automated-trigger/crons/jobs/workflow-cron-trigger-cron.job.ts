import { Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { DataSource, Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { AutomatedTriggerType } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import { WORKFLOW_CRON_TRIGGER_BATCH_SIZE } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/constants/workflow-cron-trigger-batch-size.constant';
import { WORKFLOW_CRON_TRIGGER_CACHE_KEY } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/constants/workflow-cron-trigger-cache-key.constant';
import { WORKFLOW_CRON_TRIGGER_CACHE_TTL_MS } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/constants/workflow-cron-trigger-cache-ttl.constant';
import { type CronTriggerSettings } from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';
import {
  WorkflowTriggerJob,
  type WorkflowTriggerJobData,
} from 'src/modules/workflow/workflow-trigger/jobs/workflow-trigger.job';
import { shouldRunNow } from 'src/utils/should-run-now.utils';

export const WORKFLOW_CRON_TRIGGER_CRON_PATTERN = '* * * * *';

@Processor(MessageQueue.cronQueue)
export class WorkflowCronTriggerCronJob {
  private readonly logger = new Logger(WorkflowCronTriggerCronJob.name);

  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    @InjectCacheStorage(CacheStorageNamespace.ModuleWorkflow)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  @Process(WorkflowCronTriggerCronJob.name)
  @SentryCronMonitor(
    WorkflowCronTriggerCronJob.name,
    WORKFLOW_CRON_TRIGGER_CRON_PATTERN,
  )
  async handle() {
    this.logger.log('WorkflowCronTriggerCronJob started');

    const now = new Date();

    const cachedWorkspaceIds = await this.cacheStorageService.setMembers(
      WORKFLOW_CRON_TRIGGER_CACHE_KEY,
    );

    if (cachedWorkspaceIds.length > 0) {
      this.logger.log(
        `Cache hit: ${cachedWorkspaceIds.length} workspaces with cron triggers`,
      );

      await this.processWorkspacesBatched(cachedWorkspaceIds, now);
    } else {
      this.logger.log('Cache miss: performing full scan of all workspaces');

      await this.fullScanAndRebuildCache(now);
    }

    this.logger.log('WorkflowCronTriggerCronJob completed');
  }

  private async fullScanAndRebuildCache(now: Date) {
    const activeWorkspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
      select: ['id'],
    });

    this.logger.log(`Found ${activeWorkspaces.length} active workspaces`);

    const workspaceIdsWithCronTriggers: string[] = [];
    const allWorkspaceIds = activeWorkspaces.map(
      (workspace) => workspace.id,
    );

    for (
      let i = 0;
      i < allWorkspaceIds.length;
      i += WORKFLOW_CRON_TRIGGER_BATCH_SIZE
    ) {
      const batch = allWorkspaceIds.slice(
        i,
        i + WORKFLOW_CRON_TRIGGER_BATCH_SIZE,
      );

      const batchResults = await Promise.all(
        batch.map((workspaceId) =>
          this.processWorkspace(workspaceId, now),
        ),
      );

      for (const [index, hasCronTriggers] of batchResults.entries()) {
        if (hasCronTriggers) {
          workspaceIdsWithCronTriggers.push(batch[index]);
        }
      }
    }

    if (workspaceIdsWithCronTriggers.length > 0) {
      await this.cacheStorageService.setAdd(
        WORKFLOW_CRON_TRIGGER_CACHE_KEY,
        workspaceIdsWithCronTriggers,
        WORKFLOW_CRON_TRIGGER_CACHE_TTL_MS,
      );
    }

    this.logger.log(
      `Cache rebuilt with ${workspaceIdsWithCronTriggers.length} workspaces`,
    );
  }

  private async processWorkspacesBatched(
    workspaceIds: string[],
    now: Date,
  ) {
    for (
      let i = 0;
      i < workspaceIds.length;
      i += WORKFLOW_CRON_TRIGGER_BATCH_SIZE
    ) {
      const batch = workspaceIds.slice(
        i,
        i + WORKFLOW_CRON_TRIGGER_BATCH_SIZE,
      );

      await Promise.all(
        batch.map((workspaceId) =>
          this.processWorkspace(workspaceId, now),
        ),
      );
    }
  }

  private async processWorkspace(
    workspaceId: string,
    now: Date,
  ): Promise<boolean> {
    try {
      const schemaName = getWorkspaceSchemaName(workspaceId);

      const workflowAutomatedCronTriggers =
        await this.coreDataSource.query(
          `SELECT * FROM ${schemaName}."workflowAutomatedTrigger" WHERE type = '${AutomatedTriggerType.CRON}'`,
        );

      if (workflowAutomatedCronTriggers.length === 0) {
        return false;
      }

      this.logger.log(
        `Workspace ${workspaceId}: found ${workflowAutomatedCronTriggers.length} cron triggers`,
      );

      for (const trigger of workflowAutomatedCronTriggers) {
        const settings = trigger.settings as CronTriggerSettings;

        if (!isDefined(settings.pattern)) {
          this.logger.warn(
            `Trigger ${trigger.id}: skipping - pattern not defined`,
          );
          continue;
        }

        if (!shouldRunNow(settings.pattern, now)) {
          continue;
        }

        this.logger.log(
          `Trigger ${trigger.id}: enqueuing WorkflowTriggerJob for workflow ${trigger.workflowId}`,
        );

        await this.messageQueueService.add<WorkflowTriggerJobData>(
          WorkflowTriggerJob.name,
          {
            workspaceId,
            workflowId: trigger.workflowId,
            payload: {},
          },
          { retryLimit: 3 },
        );
      }

      return true;
    } catch (error) {
      this.logger.error(
        `Error processing workspace ${workspaceId}: ${error}`,
      );
      this.exceptionHandlerService.captureExceptions([error], {
        workspace: { id: workspaceId },
      });

      return false;
    }
  }
}
