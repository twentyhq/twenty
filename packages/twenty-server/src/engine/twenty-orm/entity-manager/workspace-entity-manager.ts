import { ObjectRecordsPermissions } from 'twenty-shared/types';
import {
  EntityManager,
  EntityTarget,
  InsertResult,
  ObjectLiteral,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { UpsertOptions } from 'typeorm/repository/UpsertOptions';

import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import {
  OperationType,
  validateOperationIsPermittedOrThrow,
} from 'src/engine/twenty-orm/repository/permissions.utils';
import { WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';

export class WorkspaceEntityManager extends EntityManager {
  private readonly internalContext: WorkspaceInternalContext;
  readonly repositories: Map<string, Repository<any>>;
  declare connection: WorkspaceDataSource;

  constructor(
    internalContext: WorkspaceInternalContext,
    connection: WorkspaceDataSource,
    queryRunner?: QueryRunner,
  ) {
    super(connection, queryRunner);
    this.internalContext = internalContext;
    this.repositories = new Map();
  }

  getFeatureFlagMap(): FeatureFlagMap {
    return this.connection.featureFlagMap;
  }

  override getRepository<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity>,
    shouldBypassPermissionChecks = false,
    roleId?: string,
  ): WorkspaceRepository<Entity> {
    const dataSource = this.connection;

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

  override createQueryBuilder<Entity extends ObjectLiteral>(
    entityClassOrQueryRunner?: EntityTarget<Entity> | QueryRunner,
    alias?: string,
    queryRunner?: QueryRunner,
    options: {
      shouldBypassPermissionChecks: boolean;
      roleId?: string;
    } = {
      shouldBypassPermissionChecks: false,
    },
  ): SelectQueryBuilder<Entity> | WorkspaceSelectQueryBuilder<Entity> {
    let queryBuilder: SelectQueryBuilder<Entity>;

    if (alias) {
      queryBuilder = super.createQueryBuilder(
        entityClassOrQueryRunner as EntityTarget<Entity>,
        alias as string,
        queryRunner as QueryRunner | undefined,
      );
    } else {
      queryBuilder = super.createQueryBuilder(
        entityClassOrQueryRunner as QueryRunner,
      );
    }

    const featureFlagMap = this.getFeatureFlagMap();

    const isPermissionsV2Enabled =
      featureFlagMap[FeatureFlagKey.IsPermissionsV2Enabled];

    if (!isPermissionsV2Enabled) {
      return queryBuilder;
    } else {
      let objectPermissions = {};

      if (options?.roleId) {
        const dataSource = this.connection as WorkspaceDataSource;
        const objectPermissionsByRoleId = dataSource.permissionsPerRoleId;

        objectPermissions = objectPermissionsByRoleId?.[options.roleId] ?? {};
      }

      return new WorkspaceSelectQueryBuilder(
        queryBuilder,
        objectPermissions,
        this.internalContext,
        options?.shouldBypassPermissionChecks ?? false,
      );
    }
  }

  override insert<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity>,
    entityOrEntities:
      | QueryDeepPartialEntity<Entity>
      | QueryDeepPartialEntity<Entity>[],
    options?: {
      shouldBypassPermissionChecks?: boolean;
      objectRecordsPermissions?: ObjectRecordsPermissions;
    },
  ): Promise<InsertResult> {
    this.validatePermissions(target, 'insert', options);

    return super.insert(target, entityOrEntities);
  }

  override upsert<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity>,
    entityOrEntities:
      | QueryDeepPartialEntity<Entity>
      | QueryDeepPartialEntity<Entity>[],
    conflictPathsOrOptions: string[] | UpsertOptions<Entity>,
    options?: {
      shouldBypassPermissionChecks?: boolean;
      objectRecordsPermissions?: ObjectRecordsPermissions;
    },
  ): Promise<InsertResult> {
    this.validatePermissions(target, 'update', options);

    return super.upsert(target, entityOrEntities, conflictPathsOrOptions);
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

  private validatePermissions<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity>,
    operationType: OperationType,
    options?: {
      shouldBypassPermissionChecks?: boolean;
      objectRecordsPermissions?: ObjectRecordsPermissions;
    },
  ): void {
    const featureFlagMap = this.getFeatureFlagMap();

    const isPermissionsV2Enabled =
      featureFlagMap[FeatureFlagKey.IsPermissionsV2Enabled];

    if (!isPermissionsV2Enabled) {
      return;
    }

    if (options?.shouldBypassPermissionChecks === true) {
      return;
    }

    validateOperationIsPermittedOrThrow({
      entityName: this.extractTargetNameSingularFromEntityTarget(target),
      operationType,
      objectRecordsPermissions: options?.objectRecordsPermissions ?? {},
      objectMetadataMaps: this.internalContext.objectMetadataMaps,
    });
  }

  private extractTargetNameSingularFromEntityTarget(
    target: EntityTarget<any>,
  ): string {
    return this.connection.getMetadata(target).name;
  }
}
