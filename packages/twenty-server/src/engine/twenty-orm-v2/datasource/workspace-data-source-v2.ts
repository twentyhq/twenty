import { type Pool } from 'pg';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectsPermissionsByRoleId } from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { ClientQueryExecutor } from 'src/engine/twenty-orm-v2/executor/client-query-executor';
import { PoolQueryExecutor } from 'src/engine/twenty-orm-v2/executor/pool-query-executor';
import { type QueryExecutorV2 } from 'src/engine/twenty-orm-v2/executor/types/query-executor-v2.type';
import {
  TwentyOrmV2Exception,
  TwentyOrmV2ExceptionCode,
} from 'src/engine/twenty-orm-v2/exceptions/twenty-orm-v2.exception';
import { runInRollbackSafeTransaction } from 'src/engine/twenty-orm-v2/datasource/utils/run-in-rollback-safe-transaction.util';
import { WorkspaceRepositoryV2 } from 'src/engine/twenty-orm-v2/repository/workspace-repository-v2';
import { type WorkspaceTableShape } from 'src/engine/twenty-orm-v2/table-shape/types/workspace-table-shape.type';
import { buildWorkspaceTableShape } from 'src/engine/twenty-orm-v2/table-shape/utils/build-workspace-table-shape.util';
import { resolveObjectRecordsPermissions } from 'src/engine/twenty-orm-v2/utils/resolve-object-records-permissions.util';

const tableShapeCacheByFlatObjectMetadataMaps = new WeakMap<
  object,
  Map<string, WorkspaceTableShape>
>();

export type WorkspaceTransactionScopeV2 = {
  getRepository: (
    nameSingular: string,
    rolePermissionConfig?: RolePermissionConfig,
  ) => WorkspaceRepositoryV2;
  executeRawQuery: (
    sql: string,
    parameters?: unknown[],
  ) => Promise<Record<string, unknown>[]>;
};

export class WorkspaceDataSourceV2 {
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

  getRepository(
    nameSingular: string,
    rolePermissionConfig?: RolePermissionConfig,
  ): WorkspaceRepositoryV2 {
    return this.buildRepository({
      nameSingular,
      rolePermissionConfig,
      executor: new PoolQueryExecutor({ pool: this.pool }),
    });
  }

  async transaction<T>(
    work: (transactionScope: WorkspaceTransactionScopeV2) => Promise<T>,
  ): Promise<T> {
    return this.runInClientTransaction((executor) =>
      work({
        getRepository: (nameSingular, rolePermissionConfig) =>
          this.buildRepository({
            nameSingular,
            rolePermissionConfig,
            executor,
            isTransactional: true,
          }),
        executeRawQuery: (sql, parameters = []) =>
          executor.execute({ text: sql, values: parameters }),
      }),
    );
  }

  private async runInClientTransaction<T>(
    work: (executor: QueryExecutorV2) => Promise<T>,
  ): Promise<T> {
    return runInRollbackSafeTransaction({
      pool: this.pool,
      work: (client) => work(new ClientQueryExecutor({ client })),
    });
  }

  private buildRepository({
    nameSingular,
    rolePermissionConfig,
    executor,
    isTransactional = false,
  }: {
    nameSingular: string;
    rolePermissionConfig?: RolePermissionConfig;
    executor: QueryExecutorV2;
    isTransactional?: boolean;
  }): WorkspaceRepositoryV2 {
    const objectMetadataId =
      this.internalContext.objectIdByNameSingular[nameSingular];

    if (!isDefined(objectMetadataId)) {
      throw new TwentyOrmV2Exception(
        `Object "${nameSingular}" does not exist in this workspace`,
        TwentyOrmV2ExceptionCode.UNKNOWN_OBJECT,
      );
    }

    return this.buildRepositoryForObjectMetadataId({
      objectMetadataId,
      rolePermissionConfig,
      executor,
      isTransactional,
    });
  }

  private buildRepositoryForObjectMetadataId({
    objectMetadataId,
    rolePermissionConfig,
    executor,
    isTransactional = false,
  }: {
    objectMetadataId: string;
    rolePermissionConfig?: RolePermissionConfig;
    executor: QueryExecutorV2;
    isTransactional?: boolean;
  }): WorkspaceRepositoryV2 {
    const flatObjectMetadata =
      this.getFlatObjectMetadataOrThrow(objectMetadataId);

    const { objectRecordsPermissions, shouldBypassPermissionChecks } =
      resolveObjectRecordsPermissions({
        rolePermissionConfig,
        objectPermissionsByRoleId: this.objectPermissionsByRoleId,
      });

    return new WorkspaceRepositoryV2({
      tableShape: this.getTableShape(objectMetadataId),
      flatObjectMetadata,
      internalContext: this.internalContext,
      authContext: this.authContext,
      executor,
      objectRecordsPermissions,
      shouldBypassPermissionChecks,
      tableShapeByObjectMetadataId: (targetObjectMetadataId) =>
        this.getTableShape(targetObjectMetadataId),
      flatObjectMetadataByObjectMetadataId: (targetObjectMetadataId) =>
        this.getFlatObjectMetadataOrThrow(targetObjectMetadataId),
      getRepositoryForObjectMetadataId: (targetObjectMetadataId) =>
        this.buildRepositoryForObjectMetadataId({
          objectMetadataId: targetObjectMetadataId,
          rolePermissionConfig,
          executor,
          isTransactional,
        }),
      isTransactional,
      runInNewTransaction: (work) =>
        this.runInClientTransaction((transactionExecutor) =>
          work(
            this.buildRepositoryForObjectMetadataId({
              objectMetadataId,
              rolePermissionConfig,
              executor: transactionExecutor,
              isTransactional: true,
            }),
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
