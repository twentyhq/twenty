import { Entity } from '@microsoft/microsoft-graph-types';
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
  TypeORMError,
  UpdateResult,
} from 'typeorm';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { PickKeysByType } from 'typeorm/common/PickKeysByType';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { FindOptionsUtils } from 'typeorm/find-options/FindOptionsUtils';
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
      shouldBypassPermissionChecks?: boolean;
      objectRecordsPermissions?: ObjectRecordsPermissions;
    } = {
      shouldBypassPermissionChecks: false,
      objectRecordsPermissions: {},
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
      return new WorkspaceSelectQueryBuilder(
        queryBuilder,
        options?.objectRecordsPermissions ?? {},
        this.internalContext,
        options?.shouldBypassPermissionChecks ?? false,
      );
    }
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
    options: SaveOptions & {
      reload: false;
    },
    permissionOptions?: PermissionOptions,
  ): Promise<T>;

  override save<Entity, T extends DeepPartial<Entity>>(
    targetOrEntity: EntityTarget<Entity>,
    entity: T,
    options?: SaveOptions,
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

  // Not in use - forbidden or duplicated from EntityManager
  override query<T = any>(_query: string, _parameters?: any[]): Promise<T> {
    throw new Error('Method not allowed.');
  }

  override find<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    options?: FindManyOptions<Entity>,
    permissionOptions?: PermissionOptions,
  ): Promise<Entity[]> {
    const metadata = this.connection.getMetadata(entityClass);

    return this.createQueryBuilder(
      entityClass,
      FindOptionsUtils.extractFindManyOptionsAlias(options) || metadata.name,
      this.queryRunner,
      permissionOptions,
    )
      .setFindOptions(options || {})
      .getMany();
  }

  override findBy<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    permissionOptions?: PermissionOptions,
  ): Promise<Entity[]> {
    const metadata = this.connection.getMetadata(entityClass);

    return this.createQueryBuilder(
      entityClass,
      metadata.name,
      this.queryRunner,
      permissionOptions,
    )
      .setFindOptions({ where: where })
      .getMany();
  }

  override findOne<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    options: FindOneOptions<Entity>,
    permissionOptions?: PermissionOptions,
  ): Promise<Entity | null> {
    const metadata = this.connection.getMetadata(entityClass);
    // prepare alias for built query
    let alias = metadata.name;

    if (options && options.join) {
      alias = options.join.alias;
    }
    if (!options.where) {
      throw new Error(
        `You must provide selection conditions in order to find a single row.`,
      );
    }

    // create query builder and apply find options
    return this.createQueryBuilder(
      entityClass,
      alias,
      this.queryRunner,
      permissionOptions,
    )
      .setFindOptions({
        ...options,
        take: 1,
      })
      .getOne();
  }

  override findOneBy<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    permissionOptions?: PermissionOptions,
  ): Promise<Entity | null> {
    const metadata = this.connection.getMetadata(entityClass);

    // create query builder and apply find options
    return this.createQueryBuilder(
      entityClass,
      metadata.name,
      this.queryRunner,
      permissionOptions,
    )
      .setFindOptions({
        where,
        take: 1,
      })
      .getOne();
  }

  override findAndCount<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    options?: FindManyOptions<Entity>,
    permissionOptions?: PermissionOptions,
  ): Promise<[Entity[], number]> {
    const metadata = this.connection.getMetadata(entityClass);

    return this.createQueryBuilder(
      entityClass,
      FindOptionsUtils.extractFindManyOptionsAlias(options) || metadata.name,
      this.queryRunner,
      permissionOptions,
    )
      .setFindOptions(options || {})
      .getManyAndCount();
  }

  override findAndCountBy<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    permissionOptions?: PermissionOptions,
  ): Promise<[Entity[], number]> {
    const metadata = this.connection.getMetadata(entityClass);

    return this.createQueryBuilder(
      entityClass,
      metadata.name,
      this.queryRunner,
      permissionOptions,
    )
      .setFindOptions({ where })
      .getManyAndCount();
  }

  override findOneOrFail<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    options: FindOneOptions<Entity>,
    permissionOptions?: PermissionOptions,
  ): Promise<Entity> {
    return this.findOne(entityClass, options, permissionOptions).then(
      (value) => {
        if (value === null) {
          return Promise.reject(new EntityNotFoundError(entityClass, options));
        }

        return Promise.resolve(value);
      },
    );
  }

  override findOneByOrFail<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    permissionOptions?: PermissionOptions,
  ): Promise<Entity> {
    return this.findOneBy(entityClass, where, permissionOptions).then(
      (value) => {
        if (value === null) {
          return Promise.reject(new EntityNotFoundError(entityClass, where));
        }

        return Promise.resolve(value);
      },
    );
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
    // if user passed empty criteria or empty list of criterias, then throw an error
    if (
      criteria === undefined ||
      criteria === null ||
      criteria === '' ||
      (Array.isArray(criteria) && criteria.length === 0)
    ) {
      return Promise.reject(
        new TypeORMError(
          `Empty criteria(s) are not allowed for the delete method.`,
        ),
      );
    }
    if (
      typeof criteria === 'string' ||
      typeof criteria === 'number' ||
      criteria instanceof Date ||
      Array.isArray(criteria)
    ) {
      return this.createQueryBuilder(
        undefined,
        undefined,
        this.queryRunner,
        permissionOptions,
      )
        .softDelete()
        .from(targetOrEntity)
        .whereInIds(criteria)
        .execute();
    } else {
      return this.createQueryBuilder(
        undefined,
        undefined,
        this.queryRunner,
        permissionOptions,
      )
        .softDelete()
        .from(targetOrEntity)
        .where(criteria)
        .execute();
    }
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

  override restore<Entity extends ObjectLiteral>(
    targetOrEntity: EntityTarget<Entity>,
    criteria: any,
    permissionOptions?: PermissionOptions,
  ): Promise<UpdateResult> {
    // if user passed empty criteria or empty list of criterias, then throw an error
    if (
      criteria === undefined ||
      criteria === null ||
      criteria === '' ||
      (Array.isArray(criteria) && criteria.length === 0)
    ) {
      return Promise.reject(
        new TypeORMError(
          `Empty criteria(s) are not allowed for the delete method.`,
        ),
      );
    }
    if (
      typeof criteria === 'string' ||
      typeof criteria === 'number' ||
      criteria instanceof Date ||
      Array.isArray(criteria)
    ) {
      return this.createQueryBuilder(
        undefined,
        undefined,
        this.queryRunner,
        permissionOptions,
      )
        .restore()
        .from(targetOrEntity)
        .whereInIds(criteria)
        .execute();
    } else {
      return this.createQueryBuilder(
        undefined,
        undefined,
        this.queryRunner,
        permissionOptions,
      )
        .restore()
        .from(targetOrEntity)
        .where(criteria)
        .execute();
    }
  }

  override exists<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    options?: FindManyOptions<Entity>,
    permissionOptions?: PermissionOptions,
  ): Promise<boolean> {
    const metadata = this.connection.getMetadata(entityClass);

    return this.createQueryBuilder(
      entityClass,
      FindOptionsUtils.extractFindManyOptionsAlias(options) || metadata.name,
      this.queryRunner,
      permissionOptions,
    )
      .setFindOptions(options || {})
      .getExists();
  }

  override existsBy<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    permissionOptions?: PermissionOptions,
  ): Promise<boolean> {
    const metadata = this.connection.getMetadata(entityClass);

    return this.createQueryBuilder(
      entityClass,
      metadata.name,
      this.queryRunner,
      permissionOptions,
    )
      .setFindOptions({ where })
      .getExists();
  }

  override count<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    options?: FindManyOptions<Entity>,
    permissionOptions?: PermissionOptions,
  ): Promise<number> {
    const metadata = this.connection.getMetadata(entityClass);

    return this.createQueryBuilder(
      entityClass,
      FindOptionsUtils.extractFindManyOptionsAlias(options) || metadata.name,
      this.queryRunner,
      permissionOptions,
    )
      .setFindOptions(options || {})
      .getCount();
  }

  override countBy<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    permissionOptions?: PermissionOptions,
  ): Promise<number> {
    const metadata = this.connection.getMetadata(entityClass);

    return this.createQueryBuilder(
      entityClass,
      metadata.name,
      this.queryRunner,
      permissionOptions,
    )
      .setFindOptions({ where })
      .getCount();
  }

  async callAggregateFunCustom(
    entityClass: EntityTarget<Entity>,
    fnName: string,
    columnName: string,
    where = {},
    permissionOptions?: PermissionOptions,
  ) {
    const metadata = this.connection.getMetadata(entityClass);
    const column = metadata.columns.find(
      (item) => item.propertyPath === columnName,
    );

    if (!column) {
      throw new TypeORMError(
        `Column "${columnName}" was not found in table "${metadata.name}"`,
      );
    }
    const result = await this.createQueryBuilder(
      entityClass,
      metadata.name,
      this.queryRunner,
      permissionOptions,
    )
      .setFindOptions({ where })
      .select(
        `${fnName}(${this.connection.driver.escape(column.databaseName)})`,
        fnName,
      )
      .getRawOne();

    return result[fnName] === null ? null : parseFloat(result[fnName]);
  }

  override sum<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    columnName: PickKeysByType<Entity, number>,
    where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    permissionOptions?: PermissionOptions,
  ): Promise<number | null> {
    return this.callAggregateFunCustom(
      entityClass,
      'SUM',
      columnName,
      where,
      permissionOptions,
    );
  }

  override average<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    columnName: PickKeysByType<Entity, number>,
    where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    permissionOptions?: PermissionOptions,
  ): Promise<number | null> {
    return this.callAggregateFunCustom(
      entityClass,
      'AVG',
      columnName,
      where,
      permissionOptions,
    );
  }

  override minimum<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    columnName: PickKeysByType<Entity, number>,
    where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    permissionOptions?: PermissionOptions,
  ): Promise<number | null> {
    return this.callAggregateFunCustom(
      entityClass,
      'MIN',
      columnName,
      where,
      permissionOptions,
    );
  }

  override maximum<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    columnName: PickKeysByType<Entity, number>,
    where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    permissionOptions?: PermissionOptions,
  ): Promise<number | null> {
    return this.callAggregateFunCustom(
      entityClass,
      'MAX',
      columnName,
      where,
      permissionOptions,
    );
  }

  override clear<Entity>(
    entityClass: EntityTarget<Entity>,
    permissionOptions?: PermissionOptions,
  ): Promise<void> {
    this.validatePermissions(entityClass, 'delete', permissionOptions);

    return super.clear(entityClass);
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
