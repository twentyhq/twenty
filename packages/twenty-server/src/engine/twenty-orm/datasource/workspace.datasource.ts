import { Entity } from '@microsoft/microsoft-graph-types';
import { isDefined } from 'class-validator';
import { ObjectRecordsPermissionsByRoleId } from 'twenty-shared/types';
import {
  DataSource,
  DataSourceOptions,
  EntityTarget,
  ObjectLiteral,
  QueryRunner,
  ReplicationMode,
  SelectQueryBuilder,
} from 'typeorm';
import { EntityManagerFactory } from 'typeorm/entity-manager/EntityManagerFactory';

import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { WorkspaceQueryRunner } from 'src/engine/twenty-orm/query-runner/workspace-query-runner';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';

type CreateQueryBuilderOptions = {
  calledByWorkspaceEntityManager?: boolean;
};

export class WorkspaceDataSource extends DataSource {
  readonly internalContext: WorkspaceInternalContext;
  readonly manager: WorkspaceEntityManager;
  featureFlagMapVersion: string;
  featureFlagMap: FeatureFlagMap;
  rolesPermissionsVersion: string;
  permissionsPerRoleId: ObjectRecordsPermissionsByRoleId;
  dataSourceWithOverridenCreateQueryBuilder: WorkspaceDataSource;

  constructor(
    internalContext: WorkspaceInternalContext,
    options: DataSourceOptions,
    featureFlagMapVersion: string,
    featureFlagMap: FeatureFlagMap,
    rolesPermissionsVersion: string,
    permissionsPerRoleId: ObjectRecordsPermissionsByRoleId,
  ) {
    super(options);
    this.internalContext = internalContext;
    this.featureFlagMap = featureFlagMap;
    this.featureFlagMapVersion = featureFlagMapVersion;
    // Recreate manager after internalContext has been initialized
    this.manager = this.createEntityManager();
    this.rolesPermissionsVersion = rolesPermissionsVersion;
    this.permissionsPerRoleId = permissionsPerRoleId;
  }

  override getRepository<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity>,
    shouldBypassPermissionChecks = false,
    roleId?: string,
    authContext?: AuthContext,
  ): WorkspaceRepository<Entity> {
    if (shouldBypassPermissionChecks === true) {
      return this.manager.getRepository(
        target,
        {
          shouldBypassPermissionChecks: true,
        },
        authContext,
      );
    }

    if (roleId) {
      return this.manager.getRepository(
        target,
        {
          roleId,
        },
        authContext,
      );
    }

    return this.manager.getRepository(target, undefined, authContext);
  }

  override createEntityManager(
    queryRunner?: QueryRunner,
  ): WorkspaceEntityManager {
    return new WorkspaceEntityManager(this.internalContext, this, queryRunner);
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
          entityOrRunner: EntityTarget<Entity> | QueryRunner,
          alias?: string,
          queryRunner?: QueryRunner,
        ) => {
          if (isDefined(alias) && typeof alias === 'string') {
            const entity = entityOrRunner as EntityTarget<Entity>;

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

  setRolesPermissionsVersion(rolesPermissionsVersion: string) {
    this.rolesPermissionsVersion = rolesPermissionsVersion;
  }

  setRolesPermissions(permissionsPerRoleId: ObjectRecordsPermissionsByRoleId) {
    this.permissionsPerRoleId = permissionsPerRoleId;
  }

  setFeatureFlagMap(featureFlagMap: FeatureFlagMap) {
    this.featureFlagMap = featureFlagMap;
  }

  setFeatureFlagMapVersion(featureFlagMapVersion: string) {
    this.featureFlagMapVersion = featureFlagMapVersion;
  }
}
