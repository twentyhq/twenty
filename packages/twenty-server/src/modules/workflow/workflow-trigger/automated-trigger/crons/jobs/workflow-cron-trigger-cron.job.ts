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
import { type CronTriggerSettings } from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';
import { WORKFLOW_CRON_TRIGGER_CACHE_KEY } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/constants/workflow-cron-trigger-cache-key.constant';
import { WORKFLOW_CRON_TRIGGER_CACHE_TTL_MS } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/constants/workflow-cron-trigger-cache-ttl.constant';
import { type CachedCronTrigger } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/types/cached-cron-trigger.type';
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

    const cachedValues = await this.cacheStorageService.hashGetValues(
      WORKFLOW_CRON_TRIGGER_CACHE_KEY,
    );

    if (cachedValues.length > 0) {
      this.logger.log(`Cache hit: ${cachedValues.length} cached cron triggers`);

      await this.getAndRunTriggersFromCache(cachedValues, now);
    } else {
      this.logger.log('Cache miss: performing full scan of all workspaces');

      await this.getAndRunTriggersFromDatabase(now);
    }

    this.logger.log('WorkflowCronTriggerCronJob completed');
  }

  private async getAndRunTriggersFromCache(cachedValues: string[], now: Date) {
    for (const serialized of cachedValues) {
      try {
        const trigger = JSON.parse(serialized) as CachedCronTrigger;

        if (!isDefined(trigger.pattern)) {
          continue;
        }

        if (!shouldRunNow(trigger.pattern, now)) {
          continue;
        }

        this.logger.log(
          `Enqueuing WorkflowTriggerJob for workflow ${trigger.workflowId} in workspace ${trigger.workspaceId}`,
        );

        await this.messageQueueService.add<WorkflowTriggerJobData>(
          WorkflowTriggerJob.name,
          {
            workspaceId: trigger.workspaceId,
            workflowId: trigger.workflowId,
            payload: {},
          },
          { retryLimit: 3 },
        );
      } catch (error) {
        this.logger.error(`Error processing cached trigger: ${error}`);
        this.exceptionHandlerService.captureExceptions([error]);
      }
    }
  }

  private async getAndRunTriggersFromDatabase(now: Date) {
    const activeWorkspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
      select: ['id'],
    });

    this.logger.log(`Found ${activeWorkspaces.length} active workspaces`);

    let triggerCount = 0;

    for (const workspace of activeWorkspaces) {
      const triggersToCache = await this.getAndRunWorkspaceTriggersFromDatabase(
        workspace.id,
        now,
      );

      for (const trigger of triggersToCache) {
        await this.cacheStorageService.hashSet({
          key: WORKFLOW_CRON_TRIGGER_CACHE_KEY,
          field: trigger.workflowId,
          value: JSON.stringify(trigger),
        });
        triggerCount++;
      }
    }

    if (triggerCount > 0) {
      await this.cacheStorageService.expire(
        WORKFLOW_CRON_TRIGGER_CACHE_KEY,
        WORKFLOW_CRON_TRIGGER_CACHE_TTL_MS,
      );
    }

    this.logger.log(`Cache rebuilt with ${triggerCount} cron triggers`);
  }

  private async getAndRunWorkspaceTriggersFromDatabase(
    workspaceId: string,
    now: Date,
  ): Promise<CachedCronTrigger[]> {
    try {
      const schemaName = getWorkspaceSchemaName(workspaceId);

      const workflowAutomatedCronTriggers = await this.coreDataSource.query(
        `SELECT * FROM ${schemaName}."workflowAutomatedTrigger" WHERE type = '${AutomatedTriggerType.CRON}'`,
      );

      if (workflowAutomatedCronTriggers.length === 0) {
        return [];
      }

      this.logger.log(
        `Workspace ${workspaceId}: found ${workflowAutomatedCronTriggers.length} cron triggers`,
      );

      const triggersToCache: CachedCronTrigger[] = [];

      for (const trigger of workflowAutomatedCronTriggers) {
        const settings = trigger.settings as CronTriggerSettings;

        if (!isDefined(settings.pattern)) {
          this.logger.warn(
            `Trigger ${trigger.id}: skipping - pattern not defined`,
          );
          continue;
        }

        const cachedTrigger: CachedCronTrigger = {
          workspaceId,
          workflowId: trigger.workflowId,
          pattern: settings.pattern,
        };

        triggersToCache.push(cachedTrigger);

        if (shouldRunNow(settings.pattern, now)) {
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
      }

      return triggersToCache;
    } catch (error) {
      this.logger.error(`Error processing workspace ${workspaceId}: ${error}`);
      this.exceptionHandlerService.captureExceptions([error], {
        workspace: { id: workspaceId },
      });

      return [];
    }
  }
}
