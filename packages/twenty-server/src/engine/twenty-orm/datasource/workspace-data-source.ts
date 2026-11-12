import { Logger } from '@nestjs/common';

import { type Pool } from 'pg';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecord } from 'twenty-shared/types';
import { type ObjectLiteral } from 'typeorm';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';
import { type WorkspaceRepositoryOptions } from 'src/engine/twenty-orm/types/workspace-repository-options.type';
import { TwentyOrmQueryExecutor } from 'src/engine/twenty-orm/datasource/twenty-orm-query-executor';
import { toTwentyOrmException } from 'src/engine/twenty-orm/utils/to-twenty-orm-exception.util';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { ClientQueryExecutor } from 'src/engine/workspace-query-executor/client-query-executor';
import { PoolQueryExecutor } from 'src/engine/workspace-query-executor/pool-query-executor';
import { type QueryExecutor } from 'src/engine/workspace-query-executor/types/query-executor.type';
import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { runInRollbackSafeTransaction } from 'src/engine/workspace-query-executor/utils/run-in-rollback-safe-transaction.util';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { type WorkspaceTableShape } from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';
import { buildWorkspaceTableShape } from 'src/engine/twenty-orm/table-shape/utils/build-workspace-table-shape.util';
import { isSystemAuthContext } from 'src/engine/core-modules/auth/guards/is-system-auth-context.guard';

const tableShapeCache = new WeakMap<
  FlatEntityMaps<OrmFlatFieldMetadata>,
  WeakMap<FlatObjectMetadata, WorkspaceTableShape>
>();

export class WorkspaceDataSource {
  private readonly logger = new Logger(WorkspaceDataSource.name);
  private readonly pool: Pick<Pool, 'connect' | 'query'>;
  private readonly internalContext: WorkspaceInternalContext;
  private readonly authContext: WorkspaceAuthContext;

  constructor({
    pool,
    internalContext,
    authContext,
  }: {
    pool: Pick<Pool, 'connect' | 'query'>;
    internalContext: WorkspaceInternalContext;
    authContext: WorkspaceAuthContext;
  }) {
    this.pool = pool;
    this.internalContext = internalContext;
    this.authContext = authContext;
  }

  getRepository<T extends ObjectLiteral = ObjectRecord>(
    nameSingular: string,
    repositoryOptions?: WorkspaceRepositoryOptions,
  ): WorkspaceRepository<T> {
    return this.buildRepository<T>({
      nameSingular,
      shouldBypassPermissionChecks: false,
      executor: new TwentyOrmQueryExecutor({
        executor: new PoolQueryExecutor({ pool: this.pool }),
      }),
      shouldSkipEventEmission:
        repositoryOptions?.shouldSkipEventEmission ?? false,
    });
  }

  getRepositoryWithoutPermissionChecks<T extends ObjectLiteral = ObjectRecord>(
    nameSingular: string,
    repositoryOptions?: WorkspaceRepositoryOptions,
  ): WorkspaceRepository<T> {
    return this.buildRepository<T>({
      nameSingular,
      shouldBypassPermissionChecks: true,
      executor: new TwentyOrmQueryExecutor({
        executor: new PoolQueryExecutor({ pool: this.pool }),
      }),
      shouldSkipEventEmission:
        repositoryOptions?.shouldSkipEventEmission ?? false,
    });
  }

  async transaction<T>(
    work: (transactionScope: WorkspaceTransactionScope) => Promise<T>,
  ): Promise<T> {
    const afterCommitCallbacks: Array<() => void | Promise<void>> = [];
    const afterCommit: WorkspaceTransactionScope['afterCommit'] = (callback) =>
      afterCommitCallbacks.push(callback);
    const transactionalInternalContext: WorkspaceInternalContext = {
      ...this.internalContext,
      eventEmitterService: {
        emitDatabaseBatchEvent: (event) =>
          afterCommit(() =>
            this.internalContext.eventEmitterService.emitDatabaseBatchEvent(
              event,
            ),
          ),
      },
      recordAccessGroupQueue: {
        queueRecompute: async (args) => {
          afterCommit(() =>
            this.internalContext.recordAccessGroupQueue.queueRecompute(args),
          );
        },
      },
      recordStock: {
        assertRecordStockAvailable: (args) =>
          this.internalContext.recordStock.assertRecordStockAvailable(args),
        acquireRecordStock: async (args) => {
          afterCommit(() =>
            this.internalContext.recordStock.acquireRecordStock(args),
          );
        },
        releaseRecordStock: async (args) => {
          afterCommit(() =>
            this.internalContext.recordStock.releaseRecordStock(args),
          );
        },
      },
    };
    const result = await this.runInClientTransaction((executor) =>
      work({
        workspaceId: this.internalContext.workspaceId,
        getRepository: <T extends ObjectLiteral = ObjectRecord>(
          nameSingular: string,
          repositoryOptions?: WorkspaceRepositoryOptions,
        ) =>
          this.buildRepository<T>({
            nameSingular,
            shouldBypassPermissionChecks: false,
            executor,
            isTransactional: true,
            shouldSkipEventEmission:
              repositoryOptions?.shouldSkipEventEmission ?? false,
            internalContext: transactionalInternalContext,
          }),
        getRepositoryWithoutPermissionChecks: <
          T extends ObjectLiteral = ObjectRecord,
        >(
          nameSingular: string,
          repositoryOptions?: WorkspaceRepositoryOptions,
        ) =>
          this.buildRepository<T>({
            nameSingular,
            shouldBypassPermissionChecks: true,
            executor,
            isTransactional: true,
            shouldSkipEventEmission:
              repositoryOptions?.shouldSkipEventEmission ?? false,
            internalContext: transactionalInternalContext,
          }),
        executeRawQuery: (sql, parameters = []) =>
          executor.execute({ text: sql, values: parameters }),
        afterCommit,
      }),
    );

    for (const callback of afterCommitCallbacks) {
      try {
        await callback();
      } catch (error) {
        this.logger.error(
          `After-commit callback failed for workspace ${this.internalContext.workspaceId}`,
          error,
        );
      }
    }

    return result;
  }

  private async runInClientTransaction<T>(
    work: (executor: QueryExecutor) => Promise<T>,
  ): Promise<T> {
    try {
      return await runInRollbackSafeTransaction({
        pool: this.pool,
        work: (client) =>
          work(
            new TwentyOrmQueryExecutor({
              executor: new ClientQueryExecutor({ client }),
            }),
          ),
      });
    } catch (error) {
      throw toTwentyOrmException(error);
    }
  }

  private buildRepository<T extends ObjectLiteral = ObjectRecord>({
    nameSingular,
    shouldBypassPermissionChecks,
    executor,
    isTransactional = false,
    shouldSkipEventEmission = false,
    internalContext = this.internalContext,
  }: {
    nameSingular: string;
    shouldBypassPermissionChecks: boolean;
    executor: QueryExecutor;
    isTransactional?: boolean;
    shouldSkipEventEmission?: boolean;
    internalContext?: WorkspaceInternalContext;
  }): WorkspaceRepository<T> {
    const objectMetadataId =
      internalContext.objectIdByNameSingular[nameSingular];

    if (!isDefined(objectMetadataId)) {
      throw new TwentyOrmException(
        `Object "${nameSingular}" does not exist in this workspace`,
        TwentyOrmExceptionCode.UNKNOWN_OBJECT,
      );
    }

    return this.buildRepositoryForObjectMetadataId<T>({
      objectMetadataId,
      shouldBypassPermissionChecks,
      executor,
      isTransactional,
      shouldSkipEventEmission,
      internalContext,
    });
  }

  private buildRepositoryForObjectMetadataId<
    T extends ObjectLiteral = ObjectRecord,
  >({
    objectMetadataId,
    shouldBypassPermissionChecks,
    executor,
    isTransactional = false,
    shouldSkipEventEmission = false,
    internalContext = this.internalContext,
  }: {
    objectMetadataId: string;
    shouldBypassPermissionChecks: boolean;
    executor: QueryExecutor;
    isTransactional?: boolean;
    shouldSkipEventEmission?: boolean;
    internalContext?: WorkspaceInternalContext;
  }): WorkspaceRepository<T> {
    const flatObjectMetadata =
      this.getFlatObjectMetadataOrThrow(objectMetadataId);

    const shouldRepositoryBypassPermissionChecks =
      shouldBypassPermissionChecks || isSystemAuthContext(this.authContext);

    return new WorkspaceRepository<T>({
      tableShape: this.getTableShape(objectMetadataId),
      flatObjectMetadata,
      internalContext,
      authContext: this.authContext,
      executor,
      permissionsPrincipals: shouldRepositoryBypassPermissionChecks
        ? undefined
        : internalContext.permissionsPrincipals,
      shouldBypassPermissionChecks: shouldRepositoryBypassPermissionChecks,
      shouldSkipEventEmission: shouldSkipEventEmission ?? false,
      tableShapeByObjectMetadataId: (targetObjectMetadataId) =>
        this.getTableShape(targetObjectMetadataId),
      flatObjectMetadataByObjectMetadataId: (targetObjectMetadataId) =>
        this.getFlatObjectMetadataOrThrow(targetObjectMetadataId),
      getRepositoryForObjectMetadataId: <
        Entity extends ObjectLiteral = ObjectRecord,
      >(
        targetObjectMetadataId: string,
      ) =>
        this.buildRepositoryForObjectMetadataId<Entity>({
          objectMetadataId: targetObjectMetadataId,
          shouldBypassPermissionChecks,
          executor,
          isTransactional,
          shouldSkipEventEmission,
          internalContext,
        }),
      isTransactional,
      runInNewTransaction: (work) =>
        this.transaction((transactionScope) =>
          work(
            shouldBypassPermissionChecks
              ? transactionScope.getRepositoryWithoutPermissionChecks<T>(
                  flatObjectMetadata.nameSingular,
                  { shouldSkipEventEmission },
                )
              : transactionScope.getRepository<T>(
                  flatObjectMetadata.nameSingular,
                  { shouldSkipEventEmission },
                ),
          ),
        ),
    });
  }

  private getTableShape(objectMetadataId: string): WorkspaceTableShape {
    const { flatFieldMetadataMaps } = this.internalContext;
    const flatObjectMetadata =
      this.getFlatObjectMetadataOrThrow(objectMetadataId);
    const cachedShapes =
      tableShapeCache.get(flatFieldMetadataMaps) ??
      new WeakMap<FlatObjectMetadata, WorkspaceTableShape>();

    tableShapeCache.set(flatFieldMetadataMaps, cachedShapes);

    const cachedShape = cachedShapes.get(flatObjectMetadata);

    if (isDefined(cachedShape)) {
      return cachedShape;
    }

    const tableShape = buildWorkspaceTableShape({
      workspaceId: this.internalContext.workspaceId,
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    cachedShapes.set(flatObjectMetadata, tableShape);

    return tableShape;
  }

  private getFlatObjectMetadataOrThrow(
    objectMetadataId: string,
  ): FlatObjectMetadata {
    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: objectMetadataId,
      flatEntityMaps: this.internalContext.flatObjectMetadataMaps,
    });
  }
}
