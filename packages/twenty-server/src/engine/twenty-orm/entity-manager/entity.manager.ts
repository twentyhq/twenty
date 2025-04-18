import {
  DataSource,
  EntityManager,
  EntityTarget,
  ObjectLiteral,
  QueryRunner,
  Repository,
} from 'typeorm';

import { WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';

export class WorkspaceEntityManager extends EntityManager {
  private readonly internalContext: WorkspaceInternalContext;
  readonly repositories: Map<string, Repository<any>>;

  constructor(
    internalContext: WorkspaceInternalContext,
    connection: DataSource,
    queryRunner?: QueryRunner,
  ) {
    super(connection, queryRunner);
    this.internalContext = internalContext;
    this.repositories = new Map();
  }

  override getRepository<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity>,
    shouldBypassPermissionChecks = false,
    roleId?: string,
  ): WorkspaceRepository<Entity> {
    const dataSource = this.connection as WorkspaceDataSource;

    const repositoryKey = this.getRepositoryKey({
      target,
      dataSource,
      roleId,
      shouldBypassPermissionChecks,
    });
    const repoFromMap = this.repositories.get(repositoryKey);

    if (repoFromMap) {
      return repoFromMap as WorkspaceRepository<Entity>;
    }

    let objectPermissions = {};

    if (roleId) {
      const objectPermissionsByRoleId = dataSource.permissionsPerRoleId;

      objectPermissions = objectPermissionsByRoleId?.[roleId] ?? {};
    }

    const newRepository = new WorkspaceRepository<Entity>(
      this.internalContext,
      target,
      this,
      dataSource.featureFlagMap,
      this.queryRunner,
      objectPermissions,
      shouldBypassPermissionChecks,
    );

    this.repositories.set(repositoryKey, newRepository);

    return newRepository;
  }

  private getRepositoryKey({
    target,
    dataSource,
    roleId,
    shouldBypassPermissionChecks,
  }: {
    target: EntityTarget<any>;
    dataSource: WorkspaceDataSource;
    shouldBypassPermissionChecks: boolean;
    roleId?: string;
  }) {
    const repositoryPrefix = dataSource.getMetadata(target).name;
    const roleIdSuffix = roleId ? `_${roleId}` : '';
    const rolesPermissionsVersionSuffix = dataSource.rolesPermissionsVersion
      ? `_${dataSource.rolesPermissionsVersion}`
      : '';
    const featureFlagMapVersionSuffix = dataSource.featureFlagMapVersion
      ? `_${dataSource.featureFlagMapVersion}`
      : '';

    return shouldBypassPermissionChecks
      ? `${repositoryPrefix}_bypass${featureFlagMapVersionSuffix}`
      : `${repositoryPrefix}${roleIdSuffix}${rolesPermissionsVersionSuffix}${featureFlagMapVersionSuffix}`;
  }
}
