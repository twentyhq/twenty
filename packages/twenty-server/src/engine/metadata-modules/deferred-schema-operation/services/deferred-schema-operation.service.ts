import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { DataSource, In, Not } from 'typeorm';
import { type PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { DEFERRED_SCHEMA_OPERATION_MAX_ATTEMPTS } from 'src/engine/metadata-modules/deferred-schema-operation/constants/deferred-schema-operation-max-attempts.constant';
import { DeferredSchemaOperationEntity } from 'src/engine/metadata-modules/deferred-schema-operation/deferred-schema-operation.entity';
import {
  DeferredSchemaOperationException,
  DeferredSchemaOperationExceptionCode,
} from 'src/engine/metadata-modules/deferred-schema-operation/deferred-schema-operation.exception';
import {
  PROCESS_DEFERRED_SCHEMA_OPERATIONS_JOB_NAME,
  type ProcessDeferredSchemaOperationsJobData,
} from 'src/engine/metadata-modules/deferred-schema-operation/jobs/process-deferred-schema-operations.job-constants';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { createIndexInWorkspaceSchema } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/index/utils/index-action-handler.utils';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

@Injectable()
export class DeferredSchemaOperationService {
  private readonly logger = new Logger(DeferredSchemaOperationService.name);

  constructor(
    @InjectWorkspaceScopedRepository(DeferredSchemaOperationEntity)
    private readonly deferredSchemaOperationRepository: WorkspaceScopedRepository<DeferredSchemaOperationEntity>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {}

  async enqueueWorkspaceProcessing(workspaceId: string): Promise<void> {
    await this.messageQueueService.add<ProcessDeferredSchemaOperationsJobData>(
      PROCESS_DEFERRED_SCHEMA_OPERATIONS_JOB_NAME,
      { workspaceId },
      {
        id: `deferred-schema-operations.${workspaceId}`,
        retryLimit: DEFERRED_SCHEMA_OPERATION_MAX_ATTEMPTS - 1,
        backoff: { strategy: 'exponential', initialDelayMilliseconds: 30_000 },
      },
    );
  }

  async processWorkspace(workspaceId: string): Promise<void> {
    const schemaOperationDataSource =
      await this.createDataSourceWithoutQueryTimeout();

    const attemptedOperationIds: string[] = [];
    const failedOperationIds: string[] = [];

    try {
      let operation = await this.claimNextPendingOperation({
        workspaceId,
        attemptedOperationIds,
      });

      while (isDefined(operation)) {
        attemptedOperationIds.push(operation.id);

        const hasSucceeded = await this.executeOperation({
          operation,
          schemaOperationDataSource,
        });

        if (!hasSucceeded) {
          failedOperationIds.push(operation.id);
        }

        operation = await this.claimNextPendingOperation({
          workspaceId,
          attemptedOperationIds,
        });
      }
    } finally {
      await schemaOperationDataSource.destroy();
    }

    if (failedOperationIds.length > 0) {
      throw new DeferredSchemaOperationException(
        `${failedOperationIds.length} deferred schema operation(s) failed for workspace ${workspaceId}: ${failedOperationIds.join(', ')}`,
        DeferredSchemaOperationExceptionCode.OPERATIONS_FAILED,
      );
    }
  }

  private async claimNextPendingOperation({
    workspaceId,
    attemptedOperationIds,
  }: {
    workspaceId: string;
    attemptedOperationIds: string[];
  }): Promise<DeferredSchemaOperationEntity | null> {
    const pendingOperation =
      await this.deferredSchemaOperationRepository.findOne(workspaceId, {
        where: {
          status: 'PENDING',
          ...(isNonEmptyArray(attemptedOperationIds) && {
            id: Not(In(attemptedOperationIds)),
          }),
        },
        order: { createdAt: 'ASC' },
      });

    if (!isDefined(pendingOperation)) {
      return null;
    }

    const claimResult = await this.deferredSchemaOperationRepository.update(
      workspaceId,
      { id: pendingOperation.id, status: 'PENDING' },
      {
        status: 'IN_PROGRESS',
        attempts: pendingOperation.attempts + 1,
        startedAt: new Date(),
      },
    );

    if (claimResult.affected !== 1) {
      return this.claimNextPendingOperation({
        workspaceId,
        attemptedOperationIds: [...attemptedOperationIds, pendingOperation.id],
      });
    }

    return {
      ...pendingOperation,
      status: 'IN_PROGRESS',
      attempts: pendingOperation.attempts + 1,
    };
  }

  private async executeOperation({
    operation,
    schemaOperationDataSource,
  }: {
    operation: DeferredSchemaOperationEntity;
    schemaOperationDataSource: DataSource;
  }): Promise<boolean> {
    try {
      await this.createIndexConcurrently({
        operation,
        schemaOperationDataSource,
      });

      await this.deferredSchemaOperationRepository.delete(
        operation.workspaceId,
        { id: operation.id },
      );

      return true;
    } catch (error) {
      const hasReachedMaxAttempts =
        operation.attempts >= DEFERRED_SCHEMA_OPERATION_MAX_ATTEMPTS;

      await this.deferredSchemaOperationRepository.update(
        operation.workspaceId,
        { id: operation.id },
        {
          status: hasReachedMaxAttempts ? 'FAILED' : 'PENDING',
          lastError: error instanceof Error ? error.message : String(error),
        },
      );

      this.logger.error(
        `Deferred ${operation.type} ${operation.id} failed for workspace ${operation.workspaceId} (attempt ${operation.attempts}/${DEFERRED_SCHEMA_OPERATION_MAX_ATTEMPTS})`,
        error instanceof Error ? error.stack : undefined,
      );

      return false;
    }
  }

  private async createIndexConcurrently({
    operation,
    schemaOperationDataSource,
  }: {
    operation: DeferredSchemaOperationEntity;
    schemaOperationDataSource: DataSource;
  }): Promise<void> {
    const { flatIndexMaps, flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(operation.workspaceId, [
        'flatIndexMaps',
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const flatIndexMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: flatIndexMaps,
      flatEntityId: operation.indexMetadataId,
    });

    const flatObjectMetadata = isDefined(flatIndexMetadata)
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityMaps: flatObjectMetadataMaps,
          flatEntityId: flatIndexMetadata.objectMetadataId,
        })
      : undefined;

    if (!isDefined(flatIndexMetadata) || !isDefined(flatObjectMetadata)) {
      throw new DeferredSchemaOperationException(
        `Index metadata ${operation.indexMetadataId} or its object is missing from the workspace cache`,
        DeferredSchemaOperationExceptionCode.INDEX_METADATA_NOT_FOUND_IN_CACHE,
      );
    }

    const queryRunner = schemaOperationDataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      if (operation.attempts > 1) {
        const { schemaName } = getWorkspaceSchemaContextForMigration({
          workspaceId: operation.workspaceId,
          objectMetadata: flatObjectMetadata,
        });

        await this.workspaceSchemaManagerService.indexManager.dropIndex({
          queryRunner,
          schemaName,
          indexName: flatIndexMetadata.name,
          concurrently: true,
        });
      }

      const indexCreationStart = performance.now();

      await createIndexInWorkspaceSchema({
        flatIndexMetadata,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        workspaceSchemaManagerService: this.workspaceSchemaManagerService,
        queryRunner,
        workspaceId: operation.workspaceId,
        concurrently: true,
      });

      this.logger.log(
        `Created index ${flatIndexMetadata.name} for workspace ${operation.workspaceId} in ${(performance.now() - indexCreationStart).toFixed(0)}ms`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async createDataSourceWithoutQueryTimeout(): Promise<DataSource> {
    const coreDataSourceOptions = this.coreDataSource
      .options as PostgresConnectionOptions;

    const schemaOperationDataSource = new DataSource({
      ...coreDataSourceOptions,
      entities: [],
      migrations: [],
      subscribers: [],
      poolSize: 1,
      extra: {
        ...coreDataSourceOptions.extra,
        query_timeout: undefined,
      },
    });

    return schemaOperationDataSource.initialize();
  }
}
