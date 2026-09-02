import { Logger } from '@nestjs/common';

import { type Pool } from 'pg';
import { isDefined } from 'twenty-shared/utils';

import {
  type ObjectRecord,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';
import { type ObjectLiteral } from 'typeorm';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { ClientQueryExecutor } from 'src/engine/twenty-orm/executor/client-query-executor';
import { PoolQueryExecutor } from 'src/engine/twenty-orm/executor/pool-query-executor';
import { type QueryExecutor } from 'src/engine/twenty-orm/executor/types/query-executor.type';
import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { runInRollbackSafeTransaction } from 'src/engine/twenty-orm/datasource/utils/run-in-rollback-safe-transaction.util';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { type WorkspaceTableShape } from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';
import { buildWorkspaceTableShape } from 'src/engine/twenty-orm/table-shape/utils/build-workspace-table-shape.util';
import { resolveObjectRecordsPermissions } from 'src/engine/twenty-orm/utils/resolve-object-records-permissions.util';

const tableShapeCacheByFlatObjectMetadataMaps = new WeakMap<
  object,
  Map<string, WorkspaceTableShape>
>();

export class WorkspaceDataSource {
  private readonly logger = new Logger(WorkspaceDataSource.name);
  private readonly pool: Pool;
  private readonly internalContext: WorkspaceInternalContext;
  private readonly authContext: WorkspaceAuthContext;
  private readonly objectPermissionsByRoleId: ObjectsPermissionsByRoleId;

  constructor({
    pool,
    internalContext,
    authContext,
    objectPermissionsByRoleId,
  }: {
    pool: Pool;
    internalContext: WorkspaceInternalContext;
    authContext: WorkspaceAuthContext;
    objectPermissionsByRoleId: ObjectsPermissionsByRoleId;
  }) {
    this.pool = pool;
    this.internalContext = internalContext;
    this.authContext = authContext;
    this.objectPermissionsByRoleId = objectPermissionsByRoleId;
  }

  getRepository<T extends ObjectLiteral = ObjectRecord>(
    nameSingular: string,
    rolePermissionConfig?: RolePermissionConfig,
    repositoryOptions?: { shouldSkipEventEmission?: boolean },
  ): WorkspaceRepository<T> {
    return this.buildRepository<T>({
      nameSingular,
      rolePermissionConfig,
      executor: new PoolQueryExecutor({ pool: this.pool }),
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
    };
    const result = await this.runInClientTransaction((executor) =>
      work({
        getRepository: <T extends ObjectLiteral = ObjectRecord>(
          nameSingular: string,
          rolePermissionConfig?: RolePermissionConfig,
          repositoryOptions?: { shouldSkipEventEmission?: boolean },
        ) =>
          this.buildRepository<T>({
            nameSingular,
            rolePermissionConfig,
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
    return runInRollbackSafeTransaction({
      pool: this.pool,
      work: (client) => work(new ClientQueryExecutor({ client })),
    });
  }

  private buildRepository<T extends ObjectLiteral = ObjectRecord>({
    nameSingular,
    rolePermissionConfig,
    executor,
    isTransactional = false,
    shouldSkipEventEmission = false,
    internalContext = this.internalContext,
  }: {
    nameSingular: string;
    rolePermissionConfig?: RolePermissionConfig;
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
      rolePermissionConfig,
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
    rolePermissionConfig,
    executor,
    isTransactional = false,
    shouldSkipEventEmission = false,
    internalContext = this.internalContext,
  }: {
    objectMetadataId: string;
    rolePermissionConfig?: RolePermissionConfig;
    executor: QueryExecutor;
    isTransactional?: boolean;
    shouldSkipEventEmission?: boolean;
    internalContext?: WorkspaceInternalContext;
  }): WorkspaceRepository<T> {
    const flatObjectMetadata =
      this.getFlatObjectMetadataOrThrow(objectMetadataId);

    const { objectRecordsPermissions, shouldBypassPermissionChecks } =
      resolveObjectRecordsPermissions({
        rolePermissionConfig,
        objectPermissionsByRoleId: this.objectPermissionsByRoleId,
      });

    return new WorkspaceRepository<T>({
      tableShape: this.getTableShape(objectMetadataId),
      flatObjectMetadata,
      internalContext,
      authContext: this.authContext,
      executor,
      objectRecordsPermissions,
      shouldBypassPermissionChecks,
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
          rolePermissionConfig,
          executor,
          isTransactional,
          shouldSkipEventEmission,
          internalContext,
        }),
      isTransactional,
      runInNewTransaction: (work) =>
        this.transaction((transactionScope) =>
          work(
            transactionScope.getRepository<T>(
              flatObjectMetadata.nameSingular,
              rolePermissionConfig,
              { shouldSkipEventEmission },
            ),
          ),
        ),
    });
  }

  private getTableShape(objectMetadataId: string): WorkspaceTableShape {
    const cacheKey = this.internalContext.flatObjectMetadataMaps as object;
    const cachedShapes =
      tableShapeCacheByFlatObjectMetadataMaps.get(cacheKey) ??
      new Map<string, WorkspaceTableShape>();

    tableShapeCacheByFlatObjectMetadataMaps.set(cacheKey, cachedShapes);

    const cachedShape = cachedShapes.get(objectMetadataId);

    if (isDefined(cachedShape)) {
      return cachedShape;
    }

    const tableShape = buildWorkspaceTableShape({
      workspaceId: this.internalContext.workspaceId,
      flatObjectMetadata: this.getFlatObjectMetadataOrThrow(objectMetadataId),
      flatFieldMetadataMaps: this.internalContext.flatFieldMetadataMaps,
    });

    cachedShapes.set(objectMetadataId, tableShape);

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
