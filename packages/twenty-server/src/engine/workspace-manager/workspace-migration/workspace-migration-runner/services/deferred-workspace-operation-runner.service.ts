import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource, type QueryRunner } from 'typeorm';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { DEFERRED_WORKSPACE_OPERATION_DURATION_MS_BUCKET_BOUNDARIES } from 'src/engine/core-modules/metrics/constants/deferred-workspace-operation-duration-ms-bucket-boundaries.constant';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { DeferredWorkspaceOperationEntity } from 'src/engine/metadata-modules/deferred-workspace-operation/deferred-workspace-operation.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { DEFERRED_WORKSPACE_OPERATION_JOB_PRIORITY } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/deferred-workspace-operation-job-priority.constant';
import { DEFERRED_WORKSPACE_OPERATION_MAX_ATTEMPTS } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/deferred-workspace-operation-max-attempts.constant';
import { DEFERRED_WORKSPACE_OPERATION_RETRY_BACKOFF } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/deferred-workspace-operation-retry-backoff.constant';
import { DEFERRED_WORKSPACE_OPERATION_STATEMENT_TIMEOUT_MS } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/deferred-workspace-operation-statement-timeout-ms.constant';
import { RUN_DEFERRED_WORKSPACE_OPERATIONS_JOB_NAME } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/run-deferred-workspace-operations-job-name.constant';
import {
  DeferredWorkspaceOperationException,
  DeferredWorkspaceOperationExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/deferred-workspace-operation.exception';
import { type RunDeferredWorkspaceOperationsJobData } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/jobs/run-deferred-workspace-operations.job';
import { DeferredWorkspaceOperationHandlerRegistryService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/registry/deferred-workspace-operation-handler-registry.service';
import {
  type DeferredWorkspaceOperation,
  type PersistedDeferredWorkspaceOperation,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation.type';
import { getMetadataNamesToLoadForWorkspaceMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-metadata-names-to-load-for-workspace-migration.util';

@Injectable()
export class DeferredWorkspaceOperationRunnerService {
  private readonly logger = new Logger(
    DeferredWorkspaceOperationRunnerService.name,
  );

  constructor(
    @InjectWorkspaceScopedRepository(DeferredWorkspaceOperationEntity)
    private readonly deferredWorkspaceOperationRepository: WorkspaceScopedRepository<DeferredWorkspaceOperationEntity>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly deferredWorkspaceOperationHandlerRegistry: DeferredWorkspaceOperationHandlerRegistryService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly metricsService: MetricsService,
  ) {}

  async persist({
    deferredOperations,
    workspaceId,
    applicationUniversalIdentifier,
    queryRunner,
  }: {
    deferredOperations: DeferredWorkspaceOperation[];
    workspaceId: string;
    applicationUniversalIdentifier: string;
    queryRunner: QueryRunner;
  }): Promise<void> {
    if (deferredOperations.length === 0) {
      return;
    }

    await queryRunner.manager
      .getRepository(DeferredWorkspaceOperationEntity)
      .save(
        deferredOperations.map(({ name, payload }, position) => ({
          workspaceId,
          applicationUniversalIdentifier,
          name,
          payload,
          position,
          runByVersion: this.twentyConfigService.get('APP_VERSION') ?? null,
        })),
      );
  }

  async dispatchAfterCommit({
    deferredOperations,
    hasPersistedDeferredOperations,
    workspaceId,
    applicationUniversalIdentifier,
    allFlatEntityMaps,
  }: {
    deferredOperations: DeferredWorkspaceOperation[];
    hasPersistedDeferredOperations: boolean;
    workspaceId: string;
    applicationUniversalIdentifier: string;
    allFlatEntityMaps: AllFlatEntityMaps;
  }): Promise<void> {
    if (deferredOperations.length === 0) {
      return;
    }

    if (hasPersistedDeferredOperations) {
      await this.enqueue(workspaceId);

      return;
    }

    await this.executeInProcess({
      deferredOperations,
      workspaceId,
      applicationUniversalIdentifier,
      allFlatEntityMaps,
    });
  }

  async runPendingOperations(workspaceId: string): Promise<void> {
    const pendingOperations =
      await this.deferredWorkspaceOperationRepository.find(workspaceId, {
        where: { status: 'PENDING' },
        order: { createdAt: 'ASC', position: 'ASC' },
      });

    if (pendingOperations.length === 0) {
      return;
    }

    const allFlatEntityMaps = await this.loadFlatEntityMaps({
      workspaceId,
      deferredOperations: pendingOperations,
    });

    const deferredOperationDataSource =
      await this.createDeferredOperationDataSource();

    try {
      for (const pendingOperation of pendingOperations) {
        const hasSucceeded = await this.claimAndExecute({
          pendingOperation,
          allFlatEntityMaps,
          deferredOperationDataSource,
        });

        if (!hasSucceeded) {
          throw new DeferredWorkspaceOperationException(
            `Deferred workspace operation ${pendingOperation.id} failed for workspace ${workspaceId}, the following operations will run on retry`,
            DeferredWorkspaceOperationExceptionCode.EXECUTION_FAILED,
          );
        }
      }
    } finally {
      await deferredOperationDataSource.destroy();
    }
  }

  async enqueue(workspaceId: string): Promise<void> {
    try {
      await this.messageQueueService.add<RunDeferredWorkspaceOperationsJobData>(
        RUN_DEFERRED_WORKSPACE_OPERATIONS_JOB_NAME,
        { workspaceId },
        {
          deduplication: {
            id: `deferred-workspace-operations:${workspaceId}`,
            keepLastIfActive: true,
          },
          retryLimit: DEFERRED_WORKSPACE_OPERATION_MAX_ATTEMPTS - 1,
          backoff: DEFERRED_WORKSPACE_OPERATION_RETRY_BACKOFF,
          priority: DEFERRED_WORKSPACE_OPERATION_JOB_PRIORITY,
          workspaceId,
          isWorkspaceJob: true,
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to enqueue deferred workspace operations for workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async executeInProcess({
    deferredOperations,
    workspaceId,
    applicationUniversalIdentifier,
    allFlatEntityMaps,
  }: {
    deferredOperations: DeferredWorkspaceOperation[];
    workspaceId: string;
    applicationUniversalIdentifier: string;
    allFlatEntityMaps: AllFlatEntityMaps;
  }): Promise<void> {
    const queryRunner = this.coreDataSource.createQueryRunner();

    try {
      for (const deferredOperation of deferredOperations) {
        try {
          await this.deferredWorkspaceOperationHandlerRegistry
            .getHandler(deferredOperation.name)
            .execute({
              workspaceId,
              applicationUniversalIdentifier,
              payload: deferredOperation.payload,
              allFlatEntityMaps,
              attempt: 1,
              queryRunner,
            });
        } catch (error) {
          this.logger.warn(
            `Deferred operation ${deferredOperation.name} failed for workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
    } finally {
      await queryRunner.release();
    }
  }

  private async loadFlatEntityMaps({
    workspaceId,
    deferredOperations,
  }: {
    workspaceId: string;
    deferredOperations: Pick<PersistedDeferredWorkspaceOperation, 'name'>[];
  }): Promise<AllFlatEntityMaps> {
    const metadataNames = [
      ...new Set(
        deferredOperations.flatMap(
          ({ name }) =>
            this.deferredWorkspaceOperationHandlerRegistry.getHandler(name)
              .metadataNamesToLoad,
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
    pendingOperation,
    allFlatEntityMaps,
    deferredOperationDataSource,
  }: {
    pendingOperation: DeferredWorkspaceOperationEntity;
    allFlatEntityMaps: AllFlatEntityMaps;
    deferredOperationDataSource: DataSource;
  }): Promise<boolean> {
    const { id, workspaceId } = pendingOperation;
    const attempt = pendingOperation.attempts + 1;

    const claimResult = await this.deferredWorkspaceOperationRepository.update(
      workspaceId,
      { id, status: 'PENDING' },
      { status: 'IN_PROGRESS', attempts: attempt, startedAt: new Date() },
    );

    if (claimResult.affected !== 1) {
      return true;
    }

    const queryRunner = deferredOperationDataSource.createQueryRunner();
    const executionStart = performance.now();

    try {
      await queryRunner.connect();

      await this.deferredWorkspaceOperationHandlerRegistry
        .getHandler(pendingOperation.name)
        .execute({
          workspaceId,
          applicationUniversalIdentifier:
            pendingOperation.applicationUniversalIdentifier,
          payload: pendingOperation.payload,
          allFlatEntityMaps,
          attempt,
          queryRunner,
        });

      await this.deferredWorkspaceOperationRepository.delete(workspaceId, {
        id,
        status: 'IN_PROGRESS',
        attempts: attempt,
      });

      this.recordExecutionDuration({
        status: 'success',
        durationMs: performance.now() - executionStart,
      });

      this.logger.log(
        `Deferred operation ${pendingOperation.name} ${id} completed for workspace ${workspaceId} in ${(performance.now() - executionStart).toFixed(0)}ms`,
      );

      return true;
    } catch (error) {
      this.recordExecutionDuration({
        status: 'fail',
        durationMs: performance.now() - executionStart,
      });

      await this.deferredWorkspaceOperationRepository.update(
        workspaceId,
        { id, status: 'IN_PROGRESS', attempts: attempt },
        {
          status:
            attempt >= DEFERRED_WORKSPACE_OPERATION_MAX_ATTEMPTS
              ? 'FAILED'
              : 'PENDING',
          lastError: error instanceof Error ? error.message : String(error),
        },
      );

      this.logger.error(
        `Deferred operation ${pendingOperation.name} ${id} failed for workspace ${workspaceId} (attempt ${attempt}/${DEFERRED_WORKSPACE_OPERATION_MAX_ATTEMPTS})`,
        error instanceof Error ? error.stack : undefined,
      );

      return false;
    } finally {
      await queryRunner.release();
    }
  }

  private recordExecutionDuration({
    status,
    durationMs,
  }: {
    status: 'success' | 'fail';
    durationMs: number;
  }): void {
    this.metricsService.recordHistogram({
      key: MetricsKeys.DeferredWorkspaceOperationDurationMs,
      value: durationMs,
      unit: 'ms',
      attributes: { status },
      bucketBoundaries:
        DEFERRED_WORKSPACE_OPERATION_DURATION_MS_BUCKET_BOUNDARIES,
    });
  }

  private async createDeferredOperationDataSource(): Promise<DataSource> {
    const coreDataSourceOptions = this.coreDataSource.options;

    if (coreDataSourceOptions.type !== 'postgres') {
      throw new DeferredWorkspaceOperationException(
        `Deferred workspace operations require a postgres datasource, got ${coreDataSourceOptions.type}`,
        DeferredWorkspaceOperationExceptionCode.EXECUTION_FAILED,
      );
    }

    const deferredOperationDataSource = new DataSource({
      ...coreDataSourceOptions,
      entities: [],
      migrations: [],
      subscribers: [],
      poolSize: 1,
      extra: {
        ...coreDataSourceOptions.extra,
        query_timeout: undefined,
        statement_timeout: DEFERRED_WORKSPACE_OPERATION_STATEMENT_TIMEOUT_MS,
      },
    });

    return deferredOperationDataSource.initialize();
  }
}
