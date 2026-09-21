import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { WorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { computeCronPatternFromSchedule } from 'src/modules/workflow/workflow-trigger/utils/compute-cron-pattern-from-schedule';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { CronTriggerDeduplicationService } from 'src/engine/core-modules/cron/services/cron-trigger-deduplication.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { isCachedCronTrigger } from 'src/engine/core-modules/workflow/utils/cached-workflow-automated-trigger.util';
import { WorkflowCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-core-sync.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { buildCoreDispatchIds } from 'src/engine/core-modules/workflow/utils/build-core-dispatch-ids.util';
import { type QueuedWorkflowTriggerDispatchIds } from 'src/modules/workflow/workflow-trigger/utils/resolve-workflow-trigger-dispatch-mode.util';
import { WORKFLOW_CRON_TRIGGER_CACHE_KEY } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/constants/workflow-cron-trigger-cache-key.constant';
import { WORKFLOW_CRON_TRIGGER_CACHE_TTL_MS } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/constants/workflow-cron-trigger-cache-ttl.constant';
import { type CachedCronTrigger } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/types/cached-cron-trigger.type';
import {
  WorkflowTriggerJob,
  type WorkflowTriggerJobData,
} from 'src/modules/workflow/workflow-trigger/jobs/workflow-trigger.job';

export const WORKFLOW_CRON_TRIGGER_CRON_PATTERN = '* * * * *';

@Processor(MessageQueue.cronQueue)
export class WorkflowCronTriggerCronJob {
  private readonly logger = new Logger(WorkflowCronTriggerCronJob.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    @InjectCacheStorage(CacheStorageNamespace.ModuleWorkflow)
    private readonly cacheStorageService: CacheStorageService,
    private readonly cronTriggerDeduplicationService: CronTriggerDeduplicationService,
    private readonly workflowVersionCoreSyncService: WorkflowVersionCoreSyncService,
    private readonly workflowCoreSyncService: WorkflowCoreSyncService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly metricsService: MetricsService,
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
        const trigger = await this.normalizeCachedTrigger(
          JSON.parse(serialized) as CachedCronTrigger,
        );

        if (!isDefined(trigger)) {
          continue;
        }

        const shouldDispatch = await this.shouldDispatch({ trigger, now });

        if (!shouldDispatch) {
          continue;
        }

        this.logger.log(
          `Enqueuing WorkflowTriggerJob for workflow ${trigger.workflowId} in workspace ${trigger.workspaceId}`,
        );

        await this.messageQueueService.add<WorkflowTriggerJobData>(
          WorkflowTriggerJob.name,
          {
            workspaceId: trigger.workspaceId,
            workflowId: trigger.legacyWorkflowId ?? trigger.workflowId,
            ...buildCoreDispatchIds(trigger),
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
        await this.cacheStorageService.hashSetWithExpire({
          key: WORKFLOW_CRON_TRIGGER_CACHE_KEY,
          field: trigger.workflowId,
          value: JSON.stringify(trigger),
          ttlMs: WORKFLOW_CRON_TRIGGER_CACHE_TTL_MS,
        });

        triggerCount++;
      }
    }

    this.logger.log(`Cache rebuilt with ${triggerCount} cron triggers`);
  }

  private async getAndRunWorkspaceTriggersFromDatabase(
    workspaceId: string,
    now: Date,
  ): Promise<CachedCronTrigger[]> {
    try {
      const cronTriggers = await this.getWorkspaceCronTriggers(workspaceId);

      if (cronTriggers.length === 0) {
        return [];
      }

      this.logger.log(
        `Workspace ${workspaceId}: found ${cronTriggers.length} cron triggers`,
      );

      const triggersToCache: CachedCronTrigger[] = [];

      for (const cronTrigger of cronTriggers) {
        const { workflowId, pattern } = cronTrigger;

        if (!isDefined(pattern)) {
          this.logger.warn(
            `Workflow ${workflowId}: skipping - cron pattern not defined`,
          );
          continue;
        }

        const cachedTrigger = await this.normalizeCachedTrigger({
          workspaceId,
          workflowId,
          legacyWorkflowId: cronTrigger.legacyWorkflowId,
          ...buildCoreDispatchIds(cronTrigger),
          pattern,
        });

        if (!isDefined(cachedTrigger)) {
          continue;
        }

        triggersToCache.push(cachedTrigger);

        const shouldDispatch = await this.shouldDispatch({
          trigger: cachedTrigger,
          now,
        });

        if (shouldDispatch) {
          this.logger.log(
            `Enqueuing WorkflowTriggerJob for workflow ${workflowId}`,
          );

          await this.messageQueueService.add<WorkflowTriggerJobData>(
            WorkflowTriggerJob.name,
            {
              workspaceId,
              workflowId:
                cachedTrigger.legacyWorkflowId ?? cachedTrigger.workflowId,
              ...buildCoreDispatchIds(cachedTrigger),
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

  private async getWorkspaceCronTriggers(workspaceId: string): Promise<
    Array<
      {
        workflowId: string;
        legacyWorkflowId?: string;
        pattern?: string;
      } & QueuedWorkflowTriggerDispatchIds
    >
  > {
    const { workflowAutomatedTriggerMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'workflowAutomatedTriggerMaps',
      ]);

    return Object.values(workflowAutomatedTriggerMaps.byWorkflowId)
      .filter(isCachedCronTrigger)
      .map((trigger) => ({
        workflowId: trigger.workflowId,
        legacyWorkflowId: trigger.legacyWorkflowId,
        ...buildCoreDispatchIds(trigger),
        pattern: trigger.settings.pattern,
      }));
  }

  private async normalizeCachedTrigger(
    trigger: CachedCronTrigger,
  ): Promise<CachedCronTrigger | null> {
    const workflow =
      await this.workflowCoreSyncService.findCoreWorkflowByIdOrWorkspaceWorkflowId(
        trigger.workspaceId,
        trigger.workflowId,
      );

    if (!isDefined(workflow)) {
      await this.captureUnresolvableTrigger(
        trigger,
        `workflow ${trigger.workflowId} not found in core`,
      );

      return null;
    }

    if (!isDefined(workflow.lastPublishedCoreWorkflowVersionId)) {
      await this.captureUnresolvableTrigger(
        trigger,
        `workflow ${workflow.id} has no published core version`,
      );

      return null;
    }

    const version =
      await this.workflowVersionCoreSyncService.findCoreVersionById(
        trigger.workspaceId,
        workflow.lastPublishedCoreWorkflowVersionId,
      );

    if (!isDefined(version)) {
      await this.captureUnresolvableTrigger(
        trigger,
        `published core version ${workflow.lastPublishedCoreWorkflowVersionId} of workflow ${workflow.id} not found`,
      );

      return null;
    }

    const definition = version.triggers?.[0];

    if (
      version.coreWorkflowId !== workflow.id ||
      version.status !== WorkflowVersionStatus.ACTIVE ||
      definition?.type !== WorkflowTriggerType.CRON
    ) {
      return null;
    }

    return {
      workspaceId: trigger.workspaceId,
      workflowId: workflow.id,
      legacyWorkflowId: workflow.workspaceWorkflowId ?? undefined,
      ...buildCoreDispatchIds({
        coreWorkflowVersionId: version.id,
        workspaceWorkflowVersionId: version.workspaceWorkflowVersionId,
      }),
      pattern: computeCronPatternFromSchedule(definition),
    };
  }

  private async captureUnresolvableTrigger(
    trigger: CachedCronTrigger,
    reason: string,
  ): Promise<void> {
    const message = `Cron trigger for workflow ${trigger.workflowId} in workspace ${trigger.workspaceId} will never fire: ${reason}`;

    this.logger.error(message);
    this.exceptionHandlerService.captureExceptions([new Error(message)], {
      workspace: { id: trigger.workspaceId },
    });

    await this.metricsService.incrementCounterForEvent({
      key: MetricsKeys.WorkflowTriggerDispatchDropped,
      eventId: trigger.workspaceId,
      debugLog: message,
    });
  }

  private async shouldDispatch({
    trigger,
    now,
  }: {
    trigger: CachedCronTrigger;
    now: Date;
  }): Promise<boolean> {
    return this.cronTriggerDeduplicationService.shouldDispatch(
      `workflow-cron:${trigger.workspaceId}:${trigger.legacyWorkflowId ?? trigger.workflowId}`,
      trigger.pattern,
      now,
    );
  }
}
