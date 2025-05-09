import { ObjectRecordsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  DeleteResult,
  EntityManager,
  EntityTarget,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  InsertResult,
  ObjectId,
  ObjectLiteral,
  QueryRunner,
  RemoveOptions,
  Repository,
  SaveOptions,
  SelectQueryBuilder,
  UpdateResult,
} from 'typeorm';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { PickKeysByType } from 'typeorm/common/PickKeysByType';
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

type PermissionOptions = {
  shouldBypassPermissionChecks?: boolean;
  objectRecordsPermissions?: ObjectRecordsPermissions;
};

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
    permissionOptions?: {
      shouldBypassPermissionChecks?: boolean;
      roleId?: string;
    },
  ): WorkspaceRepository<Entity> {
    const dataSource = this.connection;

    const repositoryKey = this.getRepositoryKey({
      target,
      dataSource,
      roleId: permissionOptions?.roleId,
      shouldBypassPermissionChecks:
        permissionOptions?.shouldBypassPermissionChecks ?? false,
    });
    const repoFromMap = this.repositories.get(repositoryKey);

    if (repoFromMap) {
      return repoFromMap as WorkspaceRepository<Entity>;
    }

    let objectPermissions = {};

    if (permissionOptions?.roleId) {
      const objectPermissionsByRoleId = dataSource.permissionsPerRoleId;

      objectPermissions =
        objectPermissionsByRoleId?.[permissionOptions?.roleId] ?? {};
    }

    const newRepository = new WorkspaceRepository<Entity>(
      this.internalContext,
      target,
      this,
      dataSource.featureFlagMap,
      this.queryRunner,
      objectPermissions,
      permissionOptions?.shouldBypassPermissionChecks,
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
    permissionOptions?: {
      shouldBypassPermissionChecks?: boolean;
      objectRecordsPermissions?: ObjectRecordsPermissions;
    },
  ): Promise<InsertResult> {
    this.validatePermissions(target, 'insert', permissionOptions);

    return super.insert(target, entityOrEntities);
  }

  override upsert<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity>,
    entityOrEntities:
      | QueryDeepPartialEntity<Entity>
      | QueryDeepPartialEntity<Entity>[],
    conflictPathsOrOptions: string[] | UpsertOptions<Entity>,
    permissionOptions?: {
      shouldBypassPermissionChecks?: boolean;
      objectRecordsPermissions?: ObjectRecordsPermissions;
    },
  ): Promise<InsertResult> {
    this.validatePermissions(target, 'update', permissionOptions);

    return super.upsert(target, entityOrEntities, conflictPathsOrOptions);
  }

  override update<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity>,
    criteria:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | ObjectId
      | ObjectId[]
      | any,
    partialEntity: QueryDeepPartialEntity<Entity>,
    permissionOptions?: PermissionOptions,
  ): Promise<UpdateResult> {
    this.validatePermissions(target, 'update', permissionOptions);

    return super.update(target, criteria, partialEntity);
  }

  override save<Entity extends ObjectLiteral>(
    entities: Entity[],
    options?: SaveOptions,
    permissionOptions?: PermissionOptions,
  ): Promise<Entity[]>;

  override save<Entity extends ObjectLiteral>(
    entity: Entity,
    options?: SaveOptions,
    permissionOptions?: PermissionOptions,
  ): Promise<Entity>;

  override save<Entity, T extends DeepPartial<Entity>>(
    targetOrEntity: EntityTarget<Entity>,
    entities: T[],
    options: SaveOptions & {
      reload: false;
    },
    permissionOptions?: PermissionOptions,
  ): Promise<T[]>;

  override save<Entity, T extends DeepPartial<Entity>>(
    targetOrEntity: EntityTarget<Entity>,
    entities: T[],
    options?: SaveOptions,
    permissionOptions?: PermissionOptions,
  ): Promise<(T & Entity)[]>;

  override save<Entity, T extends DeepPartial<Entity>>(
    targetOrEntity: EntityTarget<Entity>,
    entity: T,
    options?: SaveOptions & {
      reload: false;
    },
    permissionOptions?: PermissionOptions,
  ): Promise<T>;

  override save<Entity extends ObjectLiteral, T extends DeepPartial<Entity>>(
    targetOrEntity: EntityTarget<Entity> | Entity | Entity[],
    entityOrMaybeOptions:
      | T
      | T[]
      | SaveOptions
      | (SaveOptions & { reload: false }),
    maybeOptionsOrMaybePermissionOptions?:
      | PermissionOptions
      | SaveOptions
      | (SaveOptions & { reload: false }),
    permissionOptions?: PermissionOptions,
  ): Promise<(T & Entity) | (T & Entity)[] | Entity | Entity[]> {
    const permissionOptionsFromArgs =
      maybeOptionsOrMaybePermissionOptions &&
      ('shouldBypassPermissionChecks' in maybeOptionsOrMaybePermissionOptions ||
        'objectRecordsPermissions' in maybeOptionsOrMaybePermissionOptions)
        ? maybeOptionsOrMaybePermissionOptions
        : permissionOptions;

    this.validatePermissions(
      targetOrEntity,
      'update',
      permissionOptionsFromArgs,
    );

    const target =
      arguments.length > 1 &&
      (typeof targetOrEntity === 'function' ||
        typeof targetOrEntity === 'string')
        ? (targetOrEntity as EntityTarget<Entity>)
        : undefined;

    const entityOrEntities = target
      ? (entityOrMaybeOptions as T | T[])
      : (targetOrEntity as Entity | Entity[]);

    const options = target
      ? (maybeOptionsOrMaybePermissionOptions as SaveOptions | undefined)
      : (entityOrMaybeOptions as SaveOptions | undefined);

    if (isDefined(target)) {
      let entity: T | undefined;
      let entities: T[] | undefined;

      if (Array.isArray(entityOrEntities)) {
        entities = entityOrEntities as T[];

        return super.save(target, entities, options);
      } else {
        entity = entityOrEntities as T;

        return super.save(target, entity, options);
      }
    } else {
      return super.save(entityOrEntities as Entity | Entity[], options);
    }
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

  validatePermissions<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity> | Entity,
    operationType: OperationType,
    permissionOptions?: {
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

    if (permissionOptions?.shouldBypassPermissionChecks === true) {
      return;
    }

    const entityName =
      typeof target === 'function' || typeof target === 'string'
        ? this.extractTargetNameSingularFromEntityTarget(target)
        : this.extractTargetNameSingularFromEntity(target);

    validateOperationIsPermittedOrThrow({
      entityName,
      operationType,
      objectRecordsPermissions:
        permissionOptions?.objectRecordsPermissions ?? {},
      objectMetadataMaps: this.internalContext.objectMetadataMaps,
    });
  }

  private extractTargetNameSingularFromEntityTarget(
    target: EntityTarget<any>,
  ): string {
    return this.connection.getMetadata(target).name;
  }

  private extractTargetNameSingularFromEntity(entity: any): string {
    return this.connection.getMetadata(entity.constructor).name;
  }

  // Not in use
  override query<T = any>(_query: string, _parameters?: any[]): Promise<T> {
    throw new Error('Method not allowed.');
  }

  override find<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    options?: FindManyOptions<Entity>,
    permissionOptions?: PermissionOptions,
  ): Promise<Entity[]> {
    this.validatePermissions(entityClass, 'select', permissionOptions);

    return super.find(entityClass, options);
  }

  override findBy<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    permissionOptions?: PermissionOptions,
  ): Promise<Entity[]> {
    this.validatePermissions(entityClass, 'select', permissionOptions);

    return super.findBy(entityClass, where);
  }

  override findOne<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    options: FindOneOptions<Entity>,
    permissionOptions?: PermissionOptions,
  ): Promise<Entity | null> {
    this.validatePermissions(entityClass, 'select', permissionOptions);

    return super.findOne(entityClass, options);
  }

  override findOneBy<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    permissionOptions?: PermissionOptions,
  ): Promise<Entity | null> {
    this.validatePermissions(entityClass, 'select', permissionOptions);

    return super.findOneBy(entityClass, where);
  }

  override findAndCount<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    options?: FindManyOptions<Entity>,
    permissionOptions?: PermissionOptions,
  ): Promise<[Entity[], number]> {
    this.validatePermissions(entityClass, 'select', permissionOptions);

    return super.findAndCount(entityClass, options);
  }

  override findAndCountBy<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    permissionOptions?: PermissionOptions,
  ): Promise<[Entity[], number]> {
    this.validatePermissions(entityClass, 'select', permissionOptions);

    return super.findAndCountBy(entityClass, where);
  }

  override findOneOrFail<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    options: FindOneOptions<Entity>,
    permissionOptions?: PermissionOptions,
  ): Promise<Entity> {
    this.validatePermissions(entityClass, 'select', permissionOptions);

    return super.findOneOrFail(entityClass, options);
  }

  override findOneByOrFail<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    permissionOptions?: PermissionOptions,
  ): Promise<Entity> {
    this.validatePermissions(entityClass, 'select', permissionOptions);

    return super.findOneByOrFail(entityClass, where);
  }

  override delete<Entity extends ObjectLiteral>(
    targetOrEntity: EntityTarget<Entity>,
    criteria: any,
    permissionOptions?: PermissionOptions,
  ): Promise<DeleteResult> {
    this.validatePermissions(targetOrEntity, 'delete', permissionOptions);

    return super.delete(targetOrEntity, criteria);
  }

  override remove<Entity>(
    entity: Entity,
    options?: RemoveOptions,
    permissionOptions?: PermissionOptions,
  ): Promise<Entity>;

  override remove<Entity>(
    targetOrEntity: EntityTarget<Entity>,
    entity: Entity,
    options?: RemoveOptions,
    permissionOptions?: PermissionOptions,
  ): Promise<Entity>;

  override remove<Entity>(
    entity: Entity[],
    options?: RemoveOptions,
    permissionOptions?: PermissionOptions,
  ): Promise<Entity>;

  override remove<Entity>(
    targetOrEntity: EntityTarget<Entity>,
    entity: Entity[],
    options?: RemoveOptions,
    permissionOptions?: PermissionOptions,
  ): Promise<Entity[]>;

  override remove<Entity extends ObjectLiteral>(
    targetOrEntity: EntityTarget<Entity> | Entity[] | Entity,
    entityOrMaybeOptions: Entity | Entity[] | RemoveOptions,
    maybeOptionsOrMaybePermissionOptions?: RemoveOptions | PermissionOptions,
    permissionOptions?: PermissionOptions,
  ): Promise<Entity | Entity[]> {
    const permissionOptionsFromArgs =
      maybeOptionsOrMaybePermissionOptions &&
      ('shouldBypassPermissionChecks' in maybeOptionsOrMaybePermissionOptions ||
        'objectRecordsPermissions' in maybeOptionsOrMaybePermissionOptions)
        ? (maybeOptionsOrMaybePermissionOptions as PermissionOptions)
        : permissionOptions;

    this.validatePermissions(
      targetOrEntity,
      'delete',
      permissionOptionsFromArgs,
    );

    const target =
      typeof targetOrEntity === 'function' || typeof targetOrEntity === 'string'
        ? (targetOrEntity as EntityTarget<Entity>)
        : undefined;

    const entityOrEntities = target
      ? (entityOrMaybeOptions as Entity | Entity[])
      : (targetOrEntity as Entity | Entity[]);

    const options = target
      ? (maybeOptionsOrMaybePermissionOptions as RemoveOptions | undefined)
      : (entityOrMaybeOptions as RemoveOptions);

    if (isDefined(target)) {
      if (Array.isArray(entityOrEntities)) {
        return super.remove(target, entityOrEntities as Entity[], options);
      } else {
        return super.remove(target, entityOrEntities as Entity, options);
      }
    } else {
      return super.remove(entityOrEntities as Entity | Entity[], options);
    }
  }

  override softDelete<Entity extends ObjectLiteral>(
    targetOrEntity: EntityTarget<Entity>,
    criteria: any,
    permissionOptions?: PermissionOptions,
  ): Promise<UpdateResult> {
    this.validatePermissions(targetOrEntity, 'delete', permissionOptions);

    return super.softDelete(targetOrEntity, criteria);
  }

  override softRemove<Entity extends ObjectLiteral>(
    entities: Entity[],
    options?: SaveOptions,
    permissionOptions?: PermissionOptions,
  ): Promise<Entity[]>;

  override softRemove<Entity extends ObjectLiteral>(
    entities: Entity,
    options?: SaveOptions,
    permissionOptions?: PermissionOptions,
  ): Promise<Entity>;

  override softRemove<
    Entity extends ObjectLiteral,
    T extends DeepPartial<Entity>,
  >(
    targetOrEntity: EntityTarget<Entity>,
    entities: T[],
    options?: SaveOptions,
    permissionOptions?: PermissionOptions,
  ): Promise<T[]>;

  override softRemove<
    Entity extends ObjectLiteral,
    T extends DeepPartial<Entity>,
  >(
    targetOrEntity: EntityTarget<Entity>,
    entities: T,
    options?: SaveOptions,
    permissionOptions?: PermissionOptions,
  ): Promise<T>;

  override async softRemove<
    Entity extends ObjectLiteral,
    T extends DeepPartial<Entity>,
  >(
    targetOrEntityOrEntities: Entity | Entity[] | EntityTarget<Entity>,
    entitiesOrMaybeOptions: T | T[] | SaveOptions,
    maybeOptionsOrMaybePermissionOptions?: SaveOptions | PermissionOptions,
    permissionOptions?: PermissionOptions,
  ): Promise<Entity | Entity[] | T | T[]> {
    const permissionOptionsFromArgs =
      maybeOptionsOrMaybePermissionOptions &&
      ('shouldBypassPermissionChecks' in maybeOptionsOrMaybePermissionOptions ||
        'objectRecordsPermissions' in maybeOptionsOrMaybePermissionOptions)
        ? (maybeOptionsOrMaybePermissionOptions as PermissionOptions)
        : permissionOptions;

    this.validatePermissions(
      targetOrEntityOrEntities,
      'soft-delete',
      permissionOptionsFromArgs,
    );

    const target =
      typeof targetOrEntityOrEntities === 'function' ||
      typeof targetOrEntityOrEntities === 'string'
        ? (targetOrEntityOrEntities as EntityTarget<Entity>)
        : undefined;

    const entityOrEntities = target
      ? (entitiesOrMaybeOptions as T | T[])
      : (targetOrEntityOrEntities as Entity | Entity[]);

    const options = target
      ? (maybeOptionsOrMaybePermissionOptions as SaveOptions | undefined)
      : (entitiesOrMaybeOptions as SaveOptions);

    if (isDefined(target)) {
      if (Array.isArray(entityOrEntities)) {
        return super.softRemove(target, entityOrEntities as T[], options);
      } else {
        return super.softRemove(target, entityOrEntities as T, options);
      }
    } else {
      if (Array.isArray(entityOrEntities)) {
        return super.softRemove(entityOrEntities as Entity | Entity[], options);
      } else {
        return super.softRemove(entityOrEntities as Entity, options);
      }
    }
  }

  override restore<Entity extends ObjectLiteral>(
    targetOrEntity: EntityTarget<Entity>,
    criteria: any,
    permissionOptions?: PermissionOptions,
  ): Promise<UpdateResult> {
    this.validatePermissions(targetOrEntity, 'update', permissionOptions);

    return super.restore(targetOrEntity, criteria);
  }

  override recover<Entity>(
    entities: Entity[],
    options?: SaveOptions,
    permissionOptions?: PermissionOptions,
  ): Promise<Entity[]>;

  override recover<Entity>(
    entity: Entity,
    options?: SaveOptions,
    permissionOptions?: PermissionOptions,
  ): Promise<Entity>;

  override recover<Entity, T extends DeepPartial<Entity>>(
    targetOrEntity: EntityTarget<Entity>,
    entities: T[],
    options?: SaveOptions,
    permissionOptions?: PermissionOptions,
  ): Promise<T[]>;

  override recover<Entity, T extends DeepPartial<Entity>>(
    targetOrEntity: EntityTarget<Entity>,
    entity: T,
    options?: SaveOptions,
    permissionOptions?: PermissionOptions,
  ): Promise<T>;

  override recover<Entity extends ObjectLiteral, T extends DeepPartial<Entity>>(
    targetOrEntityOrEntities: EntityTarget<Entity> | Entity | Entity[],
    entityOrEntitiesOrMaybeOptions: T | T[] | SaveOptions,
    maybeOptionsOrMaybePermissionOptions?: SaveOptions | PermissionOptions,
    permissionOptions?: PermissionOptions,
  ): Promise<Entity | Entity[] | T | T[]> {
    const permissionOptionsFromArgs =
      maybeOptionsOrMaybePermissionOptions &&
      ('shouldBypassPermissionChecks' in maybeOptionsOrMaybePermissionOptions ||
        'objectRecordsPermissions' in maybeOptionsOrMaybePermissionOptions)
        ? (maybeOptionsOrMaybePermissionOptions as PermissionOptions)
        : permissionOptions;

    this.validatePermissions(
      targetOrEntityOrEntities,
      'update',
      permissionOptionsFromArgs,
    );

    const target =
      typeof targetOrEntityOrEntities === 'function' ||
      typeof targetOrEntityOrEntities === 'string'
        ? (targetOrEntityOrEntities as EntityTarget<Entity>)
        : undefined;

    const options = target
      ? (maybeOptionsOrMaybePermissionOptions as SaveOptions | undefined)
      : (entityOrEntitiesOrMaybeOptions as SaveOptions);

    if (target) {
      if (Array.isArray(entityOrEntitiesOrMaybeOptions)) {
        return super.recover(
          target,
          entityOrEntitiesOrMaybeOptions as T[],
          options,
        );
      } else {
        return super.recover(
          target,
          entityOrEntitiesOrMaybeOptions as T,
          options,
        );
      }
    } else {
      if (Array.isArray(entityOrEntitiesOrMaybeOptions)) {
        return super.recover(
          entityOrEntitiesOrMaybeOptions as Entity | Entity[],
          options,
        );
      } else {
        return super.recover(entityOrEntitiesOrMaybeOptions as Entity, options);
      }
    }
  }

  override exists<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    options?: FindManyOptions<Entity>,
    permissionOptions?: PermissionOptions,
  ): Promise<boolean> {
    this.validatePermissions(entityClass, 'select', permissionOptions);

    return super.exists(entityClass, options);
  }

  override existsBy<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    permissionOptions?: PermissionOptions,
  ): Promise<boolean> {
    this.validatePermissions(entityClass, 'select', permissionOptions);

    return super.existsBy(entityClass, where);
  }

  override count<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    options?: FindManyOptions<Entity>,
    permissionOptions?: PermissionOptions,
  ): Promise<number> {
    this.validatePermissions(entityClass, 'select', permissionOptions);

    return super.count(entityClass, options);
  }

  override countBy<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    permissionOptions?: PermissionOptions,
  ): Promise<number> {
    this.validatePermissions(entityClass, 'select', permissionOptions);

    return super.countBy(entityClass, where);
  }

  override sum<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    columnName: PickKeysByType<Entity, number>,
    where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    permissionOptions?: PermissionOptions,
  ): Promise<number | null> {
    this.validatePermissions(entityClass, 'select', permissionOptions);

    return super.sum(entityClass, columnName, where);
  }

  override average<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    columnName: PickKeysByType<Entity, number>,
    where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    permissionOptions?: PermissionOptions,
  ): Promise<number | null> {
    this.validatePermissions(entityClass, 'select', permissionOptions);

    return super.average(entityClass, columnName, where);
  }

  override minimum<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    columnName: PickKeysByType<Entity, number>,
    where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    permissionOptions?: PermissionOptions,
  ): Promise<number | null> {
    this.validatePermissions(entityClass, 'select', permissionOptions);

    return super.minimum(entityClass, columnName, where);
  }

  override maximum<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    columnName: PickKeysByType<Entity, number>,
    where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    permissionOptions?: PermissionOptions,
  ): Promise<number | null> {
    this.validatePermissions(entityClass, 'select', permissionOptions);

    return super.maximum(entityClass, columnName, where);
  }

  override clear<Entity>(
    entityClass: EntityTarget<Entity>,
    permissionOptions?: PermissionOptions,
  ): Promise<void> {
    this.validatePermissions(entityClass, 'delete', permissionOptions);

    return super.clear(entityClass);
  }

  override increment<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    conditions: any,
    propertyPath: string,
    value: number | string,
    permissionOptions?: PermissionOptions,
  ): Promise<UpdateResult> {
    this.validatePermissions(entityClass, 'update', permissionOptions);

    return super.increment(entityClass, conditions, propertyPath, value);
  }

  override decrement<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    conditions: any,
    propertyPath: string,
    value: number | string,
    permissionOptions?: PermissionOptions,
  ): Promise<UpdateResult> {
    this.validatePermissions(entityClass, 'update', permissionOptions);

    return super.decrement(entityClass, conditions, propertyPath, value);
  }

  override preload<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    entityLike: DeepPartial<Entity>,
    permissionOptions?: PermissionOptions,
  ): Promise<Entity | undefined> {
    this.validatePermissions(entityClass, 'select', permissionOptions);

    return super.preload(entityClass, entityLike);
  }
}
