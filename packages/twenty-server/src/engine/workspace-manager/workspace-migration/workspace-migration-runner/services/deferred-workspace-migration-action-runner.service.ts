import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import {
  DataSource,
  LessThan,
  MoreThanOrEqual,
  type QueryRunner,
} from 'typeorm';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WORKSPACE_MIGRATION_DURATION_MS_BUCKET_BOUNDARIES } from 'src/engine/core-modules/metrics/constants/workspace-migration-duration-ms-bucket-boundaries.constant';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { DeferredWorkspaceMigrationActionEntity } from 'src/engine/metadata-modules/deferred-workspace-migration-action/deferred-workspace-migration-action.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { DEFERRED_WORKSPACE_MIGRATION_ACTION_MAX_ATTEMPTS } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/deferred-workspace-migration-action-max-attempts.constant';
import { DEFERRED_WORKSPACE_MIGRATION_ACTION_RETRY_BACKOFF } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/deferred-workspace-migration-action-retry-backoff.constant';
import { DEFERRED_WORKSPACE_MIGRATION_ACTION_STATEMENT_TIMEOUT_MS } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/deferred-workspace-migration-action-statement-timeout-ms.constant';
import { DEFERRED_WORKSPACE_MIGRATION_ACTION_STALE_THRESHOLD_MS } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/deferred-workspace-migration-action-stale-threshold-ms.constant';
import { RUN_DEFERRED_WORKSPACE_MIGRATION_ACTIONS_JOB_NAME } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/run-deferred-workspace-migration-actions-job-name.constant';
import {
  DeferredWorkspaceMigrationActionException,
  DeferredWorkspaceMigrationActionExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/deferred-workspace-migration-action.exception';
import { type RunDeferredWorkspaceMigrationActionsJobData } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/jobs/run-deferred-workspace-migration-actions.job';
import { WorkspaceMigrationRunnerActionHandlerRegistryService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/registry/workspace-migration-runner-action-handler-registry.service';
import { type DeferredWorkspaceMigrationActionStatus } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-migration-action-status.type';
import {
  type DeferredWorkspaceMigrationAction,
  type PersistedDeferredWorkspaceMigrationAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-migration-action.type';
import { getMetadataNamesToLoadForWorkspaceMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-metadata-names-to-load-for-workspace-migration.util';

@Injectable()
export class DeferredWorkspaceMigrationActionRunnerService {
  private readonly logger = new Logger(
    DeferredWorkspaceMigrationActionRunnerService.name,
  );

  constructor(
    @InjectWorkspaceScopedRepository(DeferredWorkspaceMigrationActionEntity)
    private readonly deferredWorkspaceMigrationActionRepository: WorkspaceScopedRepository<DeferredWorkspaceMigrationActionEntity>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMigrationRunnerActionHandlerRegistry: WorkspaceMigrationRunnerActionHandlerRegistryService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly metricsService: MetricsService,
  ) {}

  async persist({
    deferredActions,
    workspaceId,
    applicationUniversalIdentifier,
    queryRunner,
  }: {
    deferredActions: DeferredWorkspaceMigrationAction[];
    workspaceId: string;
    applicationUniversalIdentifier: string;
    queryRunner: QueryRunner;
  }): Promise<void> {
    if (deferredActions.length === 0) {
      return;
    }

    await queryRunner.manager
      .getRepository(DeferredWorkspaceMigrationActionEntity)
      .save(
        deferredActions.map(({ actionHandlerKey, payload }, position) => ({
          workspaceId,
          applicationUniversalIdentifier,
          actionHandlerKey,
          payload,
          position,
          runByVersion: this.twentyConfigService.get('APP_VERSION') ?? null,
        })),
      );
  }

  async dispatchAfterCommit({
    deferredActions,
    hasPersistedDeferredActions,
    workspaceId,
    applicationUniversalIdentifier,
    allFlatEntityMaps,
  }: {
    deferredActions: DeferredWorkspaceMigrationAction[];
    hasPersistedDeferredActions: boolean;
    workspaceId: string;
    applicationUniversalIdentifier: string;
    allFlatEntityMaps: AllFlatEntityMaps;
  }): Promise<void> {
    if (deferredActions.length === 0) {
      return;
    }

    if (hasPersistedDeferredActions) {
      await this.enqueue(workspaceId);

      return;
    }

    await this.executeInProcess({
      deferredActions,
      workspaceId,
      applicationUniversalIdentifier,
      allFlatEntityMaps,
    });
  }

  async runPendingActions(workspaceId: string): Promise<void> {
    const pendingActions =
      await this.deferredWorkspaceMigrationActionRepository.find(workspaceId, {
        where: { status: 'PENDING' },
        order: { createdAt: 'ASC', position: 'ASC' },
      });

    if (pendingActions.length === 0) {
      return;
    }

    const allFlatEntityMaps = await this.loadFlatEntityMaps({
      workspaceId,
      deferredActions: pendingActions,
    });

    const deferredActionDataSource =
      await this.createDeferredActionDataSource();

    try {
      for (const pendingAction of pendingActions) {
        const hasSucceeded = await this.claimAndExecute({
          pendingAction,
          allFlatEntityMaps,
          deferredActionDataSource,
        });

        if (!hasSucceeded) {
          throw new DeferredWorkspaceMigrationActionException(
            `Deferred workspace migration action ${pendingAction.id} failed for workspace ${workspaceId}, the following actions will run on retry`,
            DeferredWorkspaceMigrationActionExceptionCode.EXECUTION_FAILED,
          );
        }
      }
    } finally {
      await deferredActionDataSource.destroy();
    }
  }

  async resetStaleInProgressActions(): Promise<number> {
    const staleBefore = new Date(
      Date.now() - DEFERRED_WORKSPACE_MIGRATION_ACTION_STALE_THRESHOLD_MS,
    );
    const lastError = 'Worker stopped while the action was in progress';

    const failedResult = await this.deferredWorkspaceMigrationActionRepository
      .createQueryBuilder()
      .update()
      .set({ status: 'FAILED', lastError })
      .where({
        status: 'IN_PROGRESS',
        startedAt: LessThan(staleBefore),
        attempts: MoreThanOrEqual(
          DEFERRED_WORKSPACE_MIGRATION_ACTION_MAX_ATTEMPTS,
        ),
      })
      .execute();

    const pendingResult = await this.deferredWorkspaceMigrationActionRepository
      .createQueryBuilder()
      .update()
      .set({ status: 'PENDING', lastError })
      .where({
        status: 'IN_PROGRESS',
        startedAt: LessThan(staleBefore),
      })
      .execute();

    return (failedResult.affected ?? 0) + (pendingResult.affected ?? 0);
  }

  async enqueueWorkspacesWithPendingActions(): Promise<number> {
    const workspaceIds = await this.findWorkspaceIdsByStatus('PENDING');

    for (const workspaceId of workspaceIds) {
      await this.enqueue(workspaceId);
    }

    return workspaceIds.length;
  }

  async retryFailedActions(workspaceId?: string): Promise<number> {
    const workspaceIds = isDefined(workspaceId)
      ? [workspaceId]
      : await this.findWorkspaceIdsByStatus('FAILED');

    let retriedActionCount = 0;

    for (const workspaceIdToRetry of workspaceIds) {
      const { affected } =
        await this.deferredWorkspaceMigrationActionRepository.update(
          workspaceIdToRetry,
          { status: 'FAILED' },
          { status: 'PENDING', attempts: 0, startedAt: null },
        );

      if ((affected ?? 0) > 0) {
        retriedActionCount += affected ?? 0;
        await this.enqueue(workspaceIdToRetry);
      }
    }

    return retriedActionCount;
  }

  private async findWorkspaceIdsByStatus(
    status: DeferredWorkspaceMigrationActionStatus,
  ): Promise<string[]> {
    const rows = await this.deferredWorkspaceMigrationActionRepository
      .createQueryBuilder('deferredWorkspaceMigrationAction')
      .select('deferredWorkspaceMigrationAction.workspaceId', 'workspaceId')
      .distinct(true)
      .where('deferredWorkspaceMigrationAction.status = :status', { status })
      .getRawMany<{ workspaceId: string }>();

    return rows.map(({ workspaceId }) => workspaceId);
  }

  private async enqueue(workspaceId: string): Promise<void> {
    try {
      await this.messageQueueService.add<RunDeferredWorkspaceMigrationActionsJobData>(
        RUN_DEFERRED_WORKSPACE_MIGRATION_ACTIONS_JOB_NAME,
        { workspaceId },
        {
          deduplication: {
            id: `deferred-workspace-migration-actions:${workspaceId}`,
            keepLastIfActive: true,
          },
          retryLimit: DEFERRED_WORKSPACE_MIGRATION_ACTION_MAX_ATTEMPTS - 1,
          backoff: DEFERRED_WORKSPACE_MIGRATION_ACTION_RETRY_BACKOFF,
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to enqueue deferred workspace migration actions for workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async executeInProcess({
    deferredActions,
    workspaceId,
    applicationUniversalIdentifier,
    allFlatEntityMaps,
  }: {
    deferredActions: DeferredWorkspaceMigrationAction[];
    workspaceId: string;
    applicationUniversalIdentifier: string;
    allFlatEntityMaps: AllFlatEntityMaps;
  }): Promise<void> {
    const queryRunner = this.coreDataSource.createQueryRunner();

    try {
      for (const deferredAction of deferredActions) {
        try {
          await this.workspaceMigrationRunnerActionHandlerRegistry.executeDeferredActionHandler(
            {
              deferredAction,
              workspaceId,
              applicationUniversalIdentifier,
              allFlatEntityMaps,
              attempt: 1,
              queryRunner,
            },
          );
        } catch (error) {
          this.logger.warn(
            `Deferred action ${deferredAction.actionHandlerKey} failed for workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
    } finally {
      await queryRunner.release();
    }
  }

  private async loadFlatEntityMaps({
    workspaceId,
    deferredActions,
  }: {
    workspaceId: string;
    deferredActions: Pick<
      PersistedDeferredWorkspaceMigrationAction,
      'actionHandlerKey'
    >[];
  }): Promise<AllFlatEntityMaps> {
    const metadataNames = [
      ...new Set(
        deferredActions.map(({ actionHandlerKey }) =>
          this.workspaceMigrationRunnerActionHandlerRegistry.getDeferredActionMetadataName(
            actionHandlerKey,
          ),
        ),
      ),
    ];

    return this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: getMetadataNamesToLoadForWorkspaceMigration(
          metadataNames,
        ).map(getMetadataFlatEntityMapsKey),
      },
    );
  }

  private async claimAndExecute({
    pendingAction,
    allFlatEntityMaps,
    deferredActionDataSource,
  }: {
    pendingAction: DeferredWorkspaceMigrationActionEntity;
    allFlatEntityMaps: AllFlatEntityMaps;
    deferredActionDataSource: DataSource;
  }): Promise<boolean> {
    const { id, workspaceId } = pendingAction;
    const attempt = pendingAction.attempts + 1;

    const claimResult =
      await this.deferredWorkspaceMigrationActionRepository.update(
        workspaceId,
        { id, status: 'PENDING' },
        { status: 'IN_PROGRESS', attempts: attempt, startedAt: new Date() },
      );

    if (claimResult.affected !== 1) {
      return true;
    }

    const queryRunner = deferredActionDataSource.createQueryRunner();
    const executionStart = performance.now();

    try {
      await queryRunner.connect();

      await this.workspaceMigrationRunnerActionHandlerRegistry.executeDeferredActionHandler(
        {
          deferredAction: pendingAction,
          workspaceId,
          applicationUniversalIdentifier:
            pendingAction.applicationUniversalIdentifier,
          allFlatEntityMaps,
          attempt,
          queryRunner,
        },
      );

      await this.deferredWorkspaceMigrationActionRepository.delete(
        workspaceId,
        { id },
      );

      this.recordExecutionDuration({
        actionHandlerKey: pendingAction.actionHandlerKey,
        status: 'success',
        durationMs: performance.now() - executionStart,
      });

      this.logger.log(
        `Deferred action ${pendingAction.actionHandlerKey} ${id} completed for workspace ${workspaceId} in ${(performance.now() - executionStart).toFixed(0)}ms`,
      );

      return true;
    } catch (error) {
      this.recordExecutionDuration({
        actionHandlerKey: pendingAction.actionHandlerKey,
        status: 'fail',
        durationMs: performance.now() - executionStart,
      });

      await this.deferredWorkspaceMigrationActionRepository.update(
        workspaceId,
        { id },
        {
          status:
            attempt >= DEFERRED_WORKSPACE_MIGRATION_ACTION_MAX_ATTEMPTS
              ? 'FAILED'
              : 'PENDING',
          lastError: error instanceof Error ? error.message : String(error),
        },
      );

      this.logger.error(
        `Deferred action ${pendingAction.actionHandlerKey} ${id} failed for workspace ${workspaceId} (attempt ${attempt}/${DEFERRED_WORKSPACE_MIGRATION_ACTION_MAX_ATTEMPTS})`,
        error instanceof Error ? error.stack : undefined,
      );

      return false;
    } finally {
      await queryRunner.release();
    }
  }

  private recordExecutionDuration({
    actionHandlerKey,
    status,
    durationMs,
  }: {
    actionHandlerKey: PersistedDeferredWorkspaceMigrationAction['actionHandlerKey'];
    status: 'success' | 'fail';
    durationMs: number;
  }): void {
    this.metricsService.recordHistogram({
      key: MetricsKeys.DeferredWorkspaceMigrationActionDurationMs,
      value: durationMs,
      unit: 'ms',
      attributes: { actionHandlerKey, status },
      bucketBoundaries: WORKSPACE_MIGRATION_DURATION_MS_BUCKET_BOUNDARIES,
    });
  }

  private async createDeferredActionDataSource(): Promise<DataSource> {
    const coreDataSourceOptions = this.coreDataSource.options;

    if (coreDataSourceOptions.type !== 'postgres') {
      throw new DeferredWorkspaceMigrationActionException(
        `Deferred workspace migration actions require a postgres datasource, got ${coreDataSourceOptions.type}`,
        DeferredWorkspaceMigrationActionExceptionCode.EXECUTION_FAILED,
      );
    }

    const deferredActionDataSource = new DataSource({
      ...coreDataSourceOptions,
      entities: [],
      migrations: [],
      subscribers: [],
      poolSize: 1,
      extra: {
        ...coreDataSourceOptions.extra,
        query_timeout: undefined,
        statement_timeout:
          DEFERRED_WORKSPACE_MIGRATION_ACTION_STATEMENT_TIMEOUT_MS,
      },
    });

    return deferredActionDataSource.initialize();
  }
}
