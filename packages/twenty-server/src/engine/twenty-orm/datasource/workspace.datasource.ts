import { type Entity } from '@microsoft/microsoft-graph-types';
import { isDefined } from 'class-validator';
import { type ObjectsPermissionsByRoleId } from 'twenty-shared/types';
import {
  DataSource,
  type DataSourceOptions,
  type EntityTarget,
  type ObjectLiteral,
  type QueryRunner,
  type ReplicationMode,
  type SelectQueryBuilder,
} from 'typeorm';
import { EntityManagerFactory } from 'typeorm/entity-manager/EntityManagerFactory';

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { type WorkspaceQueryRunner } from 'src/engine/twenty-orm/query-runner/workspace-query-runner';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { type WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

type WorkspaceDatasourceInternalContext = {
  workspaceId: string;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
  objectIdByNameSingular: Record<string, string>;
  featureFlagsMap: FeatureFlagMap;
  eventEmitterService: WorkspaceEventEmitter;
};

type CreateQueryBuilderOptions = {
  calledByWorkspaceEntityManager?: boolean;
};

export class WorkspaceDataSource extends DataSource {
  readonly internalContext: WorkspaceDatasourceInternalContext;
  readonly manager: WorkspaceEntityManager;
  featureFlagMapVersion: string;
  featureFlagMap: FeatureFlagMap;
  rolesPermissionsVersion: string;
  permissionsPerRoleId: ObjectsPermissionsByRoleId;
  dataSourceWithOverridenCreateQueryBuilder: WorkspaceDataSource;
  isPoolSharingEnabled: boolean;

  constructor(
    internalContext: WorkspaceDatasourceInternalContext,
    options: DataSourceOptions,
    featureFlagMapVersion: string,
    featureFlagMap: FeatureFlagMap,
    rolesPermissionsVersion: string,
    permissionsPerRoleId: ObjectsPermissionsByRoleId,
    isPoolSharingEnabled: boolean,
  ) {
    super(options);
    this.internalContext = internalContext;
    this.featureFlagMap = featureFlagMap;
    this.featureFlagMapVersion = featureFlagMapVersion;
    // Recreate manager after internalContext has been initialized
    this.manager = this.createEntityManager();
    this.rolesPermissionsVersion = rolesPermissionsVersion;
    this.permissionsPerRoleId = permissionsPerRoleId;
    this.isPoolSharingEnabled = isPoolSharingEnabled;
  }

  override getRepository<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity>,
    permissionOptions?: RolePermissionConfig,
    authContext?: AuthContext,
  ): WorkspaceRepository<Entity> {
    return this.manager.getRepository(target, permissionOptions, authContext);
  }

  override createEntityManager(
    queryRunner?: QueryRunner,
  ): WorkspaceEntityManager {
    return new WorkspaceEntityManager(
      {
        workspaceId: this.internalContext.workspaceId,
        flatObjectMetadataMaps: this.internalContext.flatObjectMetadataMaps,
        flatFieldMetadataMaps: this.internalContext.flatFieldMetadataMaps,
        flatIndexMaps: this.internalContext.flatIndexMaps,
        objectIdByNameSingular: this.internalContext.objectIdByNameSingular,
        featureFlagsMap: this.internalContext.featureFlagsMap,
        eventEmitterService: this.internalContext.eventEmitterService,
      },
      this,
      queryRunner,
    );
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

  setRolesPermissions(permissionsPerRoleId: ObjectsPermissionsByRoleId) {
    this.permissionsPerRoleId = permissionsPerRoleId;
  }

  setFeatureFlagMap(featureFlagMap: FeatureFlagMap) {
    this.featureFlagMap = featureFlagMap;
  }

  setFeatureFlagMapVersion(featureFlagMapVersion: string) {
    this.featureFlagMapVersion = featureFlagMapVersion;
  }

  override async destroy(): Promise<void> {
    if (this.isPoolSharingEnabled) {
      // eslint-disable-next-line no-console
      console.log(
        `PromiseMemoizer Event: A WorkspaceDataSource for workspace ${this.internalContext.workspaceId} is being cleared. Actual pool closure managed by PgPoolSharedService. Not calling dataSource.destroy().`,
      );
      // We should NOT call dataSource.destroy() here, because that would end
      // the shared pool, potentially affecting other active users of that pool.
      // The PgPoolSharedService is responsible for the lifecycle of shared pools.

      return Promise.resolve();
    } else {
      // eslint-disable-next-line no-console
      console.log(
        `PromiseMemoizer Event: A WorkspaceDataSource for workspace ${this.internalContext.workspaceId} is being cleared. Calling safelyDestroyDataSource.`,
      );

      return super.destroy();
    }
  }
}
