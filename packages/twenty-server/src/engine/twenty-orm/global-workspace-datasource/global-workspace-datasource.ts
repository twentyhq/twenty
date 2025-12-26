import { type ObjectsPermissionsByRoleId } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  DataSource,
  type DataSourceOptions,
  type EntityMetadata,
  type EntityTarget,
  type ObjectLiteral,
  type QueryRunner,
  type ReplicationMode,
  type SelectQueryBuilder,
} from 'typeorm';
import { EntityManagerFactory } from 'typeorm/entity-manager/EntityManagerFactory';
import { EntityMetadataNotFoundError } from 'typeorm/error/EntityMetadataNotFoundError';

import { type WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';
import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { type WorkspaceQueryRunner } from 'src/engine/twenty-orm/query-runner/workspace-query-runner';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { type WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

type CreateQueryBuilderOptions = {
  calledByWorkspaceEntityManager?: boolean;
};

export class GlobalWorkspaceDataSource extends DataSource {
  readonly eventEmitterService: WorkspaceEventEmitter;
  private _isConstructing = true;
  dataSourceWithOverridenCreateQueryBuilder: GlobalWorkspaceDataSource;

  constructor(
    options: DataSourceOptions,
    eventEmitterService: WorkspaceEventEmitter,
  ) {
    super(options);
    this.eventEmitterService = eventEmitterService;
    this._isConstructing = false;

    Object.defineProperty(this, 'manager', {
      get: () => this.createEntityManager(),
    });
  }

  get authContext(): WorkspaceAuthContext {
    const context = getWorkspaceContext();

    return context.authContext;
  }

  get featureFlagMap(): FeatureFlagMap {
    const context = getWorkspaceContext();

    return context.featureFlagsMap;
  }

  get permissionsPerRoleId(): ObjectsPermissionsByRoleId {
    const context = getWorkspaceContext();

    return context.permissionsPerRoleId;
  }

  override getRepository<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity>,
    permissionOptions?: RolePermissionConfig,
  ): WorkspaceRepository<Entity> {
    const manager = this.createEntityManager();

    return manager.getRepository(target, permissionOptions, this.authContext);
  }

  override findMetadata(
    target: EntityTarget<ObjectLiteral>,
  ): EntityMetadata | undefined {
    const context = getWorkspaceContext();
    const { entityMetadatas } = context;

    return entityMetadatas.find((metadata) => metadata.target === target);
  }

  override getMetadata(target: EntityTarget<ObjectLiteral>): EntityMetadata {
    const metadata = this.findMetadata(target);

    if (!metadata) {
      throw new EntityMetadataNotFoundError(target);
    }

    return metadata;
  }

  override createEntityManager(
    queryRunner?: QueryRunner,
  ): WorkspaceEntityManager {
    if (this._isConstructing !== false) {
      return super.createEntityManager(queryRunner) as WorkspaceEntityManager;
    }

    return new WorkspaceEntityManager(this, queryRunner);
  }

  override createQueryRunner(
    mode = 'master' as ReplicationMode,
  ): WorkspaceQueryRunner {
    const queryRunner = this.driver.createQueryRunner(mode);
    const manager = this.createEntityManager(queryRunner);

    Object.assign(queryRunner, { manager: manager });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return queryRunner as any as WorkspaceQueryRunner;
  }

  // Do not use, only for specific permission-related purpose
  createQueryRunnerForEntityPersistExecutor(
    mode = 'master' as ReplicationMode,
  ) {
    if (this.dataSourceWithOverridenCreateQueryBuilder) {
      const queryRunner = this.driver.createQueryRunner(mode);
      const manager = new EntityManagerFactory().create(
        this.dataSourceWithOverridenCreateQueryBuilder,
        queryRunner,
      );

      Object.assign(queryRunner, { manager: manager });

      return queryRunner;
    }

    const dataSourceWithOverridenCreateQueryBuilder = Object.assign(
      Object.create(Object.getPrototypeOf(this)),
      this,
      {
        createQueryBuilder: (
          entityOrRunner: EntityTarget<ObjectLiteral> | QueryRunner,
          alias?: string,
          queryRunner?: QueryRunner,
        ) => {
          if (isDefined(alias) && typeof alias === 'string') {
            const entity = entityOrRunner as EntityTarget<ObjectLiteral>;

            return this.createQueryBuilder(entity, alias, queryRunner, {
              calledByWorkspaceEntityManager: true,
            });
          } else {
            const runner = entityOrRunner as QueryRunner;

            return this.createQueryBuilder(runner, {
              calledByWorkspaceEntityManager: true,
            });
          }
        },
      },
    );
    const queryRunner = this.driver.createQueryRunner(mode);
    const manager = new EntityManagerFactory().create(
      dataSourceWithOverridenCreateQueryBuilder,
      queryRunner,
    );

    Object.assign(queryRunner, { manager: manager });

    return queryRunner;
  }

  override createQueryBuilder<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    alias: string,
    queryRunner?: QueryRunner,
    options?: CreateQueryBuilderOptions,
  ): SelectQueryBuilder<Entity>;

  override createQueryBuilder(
    queryRunner?: QueryRunner,
    options?: CreateQueryBuilderOptions, // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): SelectQueryBuilder<any>;

  // Only callable from workspaceEntityManager to guarantee a permission check was run
  override createQueryBuilder(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryRunnerOrEntityClass?: QueryRunner | EntityTarget<any>,
    aliasOrOptions?: string | CreateQueryBuilderOptions,
    queryRunner?: QueryRunner,
    options?: CreateQueryBuilderOptions,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): SelectQueryBuilder<any> {
    let calledByWorkspaceEntityManager;

    const isCalledWithEntityTarget =
      isDefined(aliasOrOptions) && typeof aliasOrOptions === 'string';

    if (isCalledWithEntityTarget) {
      calledByWorkspaceEntityManager = options?.calledByWorkspaceEntityManager;
    } else {
      calledByWorkspaceEntityManager = (
        aliasOrOptions as CreateQueryBuilderOptions
      )?.calledByWorkspaceEntityManager;
    }

    if (!(calledByWorkspaceEntityManager === true)) {
      throw new PermissionsException(
        'Method not allowed because permissions are not implemented at datasource level.',
        PermissionsExceptionCode.METHOD_NOT_ALLOWED,
      );
    }

    if (isCalledWithEntityTarget) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const entityClass = queryRunnerOrEntityClass as EntityTarget<any>;

      return super.createQueryBuilder(
        entityClass,
        aliasOrOptions as string,
        queryRunner,
      );
    } else {
      const queryRunner = queryRunnerOrEntityClass as QueryRunner;

      return super.createQueryBuilder(queryRunner);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override query<T = any>(
    query: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parameters?: any[],
    queryRunner?: QueryRunner,
    options?: {
      shouldBypassPermissionChecks?: boolean;
    },
  ): Promise<T> {
    if (!options?.shouldBypassPermissionChecks) {
      throw new PermissionsException(
        'Method not allowed because permissions are not implemented at datasource level.',
        PermissionsExceptionCode.METHOD_NOT_ALLOWED,
      );
    }

    return super.query(query, parameters, queryRunner);
  }
}
