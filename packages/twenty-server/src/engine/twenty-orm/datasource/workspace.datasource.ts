import { ObjectRecordsPermissionsByRoleId } from 'twenty-shared/types';
import {
  DataSource,
  DataSourceOptions,
  EntityTarget,
  ObjectLiteral,
  QueryRunner,
} from 'typeorm';

import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { UserWorkspaceRoleMap } from 'src/engine/metadata-modules/workspace-permissions-cache/types/user-workspace-role-map.type';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/entity.manager';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';

export class WorkspaceDataSource extends DataSource {
  readonly internalContext: WorkspaceInternalContext;
  readonly manager: WorkspaceEntityManager;
  featureFlagMapVersion: string;
  featureFlagMap: FeatureFlagMap;
  userWorkspaceRoleMapVersion: string;
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
  rolesPermissionsVersion: string;
  permissionsPerRoleId: ObjectRecordsPermissionsByRoleId;

  constructor(
    internalContext: WorkspaceInternalContext,
    options: DataSourceOptions,
    featureFlagMapVersion: string,
    featureFlagMap: FeatureFlagMap,
    userWorkspaceRoleMapVersion: string,
    userWorkspaceRoleMap: UserWorkspaceRoleMap,
    rolesPermissionsVersion: string,
    permissionsPerRoleId: ObjectRecordsPermissionsByRoleId,
  ) {
    super(options);
    this.internalContext = internalContext;
    // Recreate manager after internalContext has been initialized
    this.manager = this.createEntityManager();
    this.featureFlagMap = featureFlagMap;
    this.featureFlagMapVersion = featureFlagMapVersion;
    this.rolesPermissionsVersion = rolesPermissionsVersion;
    this.permissionsPerRoleId = permissionsPerRoleId;
    this.userWorkspaceRoleMapVersion = userWorkspaceRoleMapVersion;
    this.userWorkspaceRoleMap = userWorkspaceRoleMap;
  }

  override getRepository<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity>,
    roleId?: string,
  ): WorkspaceRepository<Entity> {
    if (roleId) {
      return this.manager.getRepository(target, roleId);
    }

    return this.manager.getRepository(target);
  }

  override createEntityManager(
    queryRunner?: QueryRunner,
  ): WorkspaceEntityManager {
    return new WorkspaceEntityManager(this.internalContext, this, queryRunner);
  }

  setRolesPermissionsVersion(rolesPermissionsVersion: string) {
    this.rolesPermissionsVersion = rolesPermissionsVersion;
  }

  setRolesPermissions(permissionsPerRoleId: ObjectRecordsPermissionsByRoleId) {
    this.permissionsPerRoleId = permissionsPerRoleId;
  }

  setFeatureFlagsMap(featureFlagMap: FeatureFlagMap) {
    this.featureFlagMap = featureFlagMap;
  }

  setFeatureFlagsMapVersion(featureFlagMapVersion: string) {
    this.featureFlagMapVersion = featureFlagMapVersion;
  }

  setUserWorkspaceRoleMap(userWorkspaceRoleMap: UserWorkspaceRoleMap) {
    this.userWorkspaceRoleMap = userWorkspaceRoleMap;
  }

  setUserWorkspaceRoleMapVersion(userWorkspaceRoleMapVersion: string) {
    this.userWorkspaceRoleMapVersion = userWorkspaceRoleMapVersion;
  }
}
