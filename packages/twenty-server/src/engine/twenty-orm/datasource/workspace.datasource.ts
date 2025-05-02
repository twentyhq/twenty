import { ObjectRecordsPermissionsByRoleId } from 'twenty-shared/types';
import {
  DataSource,
  DataSourceOptions,
  EntityTarget,
  ObjectLiteral,
  QueryRunner,
  ReplicationMode,
} from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';

import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/entity.manager';
import { WorkspaceQueryRunner } from 'src/engine/twenty-orm/query-runner/workspace-query-runner';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';

type RunInTransaction<T> = (
  entityManager: WorkspaceEntityManager,
) => Promise<T>;
export class WorkspaceDataSource extends DataSource {
  readonly internalContext: WorkspaceInternalContext;
  readonly manager: WorkspaceEntityManager;
  featureFlagMapVersion: string;
  featureFlagMap: FeatureFlagMap;
  rolesPermissionsVersion: string;
  permissionsPerRoleId: ObjectRecordsPermissionsByRoleId;

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
  ): WorkspaceRepository<Entity> {
    if (shouldBypassPermissionChecks === true) {
      return this.manager.getRepository(target, shouldBypassPermissionChecks);
    }

    if (roleId) {
      return this.manager.getRepository(
        target,
        shouldBypassPermissionChecks,
        roleId,
      );
    }

    return this.manager.getRepository(target);
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

    return queryRunner as any as WorkspaceQueryRunner;
  }

  override transaction<T>(
    runInTransactionOrIsolationLevel: RunInTransaction<T> | IsolationLevel,
    maybeRunInTransaction?: RunInTransaction<T>,
  ): Promise<T> {
    if (maybeRunInTransaction) {
      return this.manager.transaction(
        runInTransactionOrIsolationLevel as IsolationLevel,
        maybeRunInTransaction,
      );
    }

    return this.manager.transaction(
      runInTransactionOrIsolationLevel as RunInTransaction<T>,
    );
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
