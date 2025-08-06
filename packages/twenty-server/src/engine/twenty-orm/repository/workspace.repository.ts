import { ObjectRecordsPermissions } from 'twenty-shared/types';
import {
  DeepPartial,
  DeleteResult,
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
  UpdateResult,
} from 'typeorm';
import { PickKeysByType } from 'typeorm/common/PickKeysByType';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { UpsertOptions } from 'typeorm/repository/UpsertOptions';

import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { DeepPartialWithNestedRelationFields } from 'src/engine/twenty-orm/entity-manager/types/deep-partial-entity-with-nested-relation-fields.type';
import { QueryDeepPartialEntityWithNestedRelationFields } from 'src/engine/twenty-orm/entity-manager/types/query-deep-partial-entity-with-nested-relation-fields.type';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { formatData } from 'src/engine/twenty-orm/utils/format-data.util';
import { getObjectMetadataFromEntityTarget } from 'src/engine/twenty-orm/utils/get-object-metadata-from-entity-target.util';

export class WorkspaceRepository<
  T extends ObjectLiteral,
> extends Repository<T> {
  private readonly internalContext: WorkspaceInternalContext;
  private shouldBypassPermissionChecks: boolean;
  private featureFlagMap: FeatureFlagMap;
  public readonly objectRecordsPermissions?: ObjectRecordsPermissions;
  private authContext?: AuthContext;
  declare manager: WorkspaceEntityManager;

  constructor(
    internalContext: WorkspaceInternalContext,
    target: EntityTarget<T>,
    manager: WorkspaceEntityManager,
    featureFlagMap: FeatureFlagMap,
    queryRunner?: QueryRunner,
    objectRecordsPermissions?: ObjectRecordsPermissions,
    shouldBypassPermissionChecks = false,
    authContext?: AuthContext,
  ) {
    super(target, manager, queryRunner);
    this.internalContext = internalContext;
    this.featureFlagMap = featureFlagMap;
    this.objectRecordsPermissions = objectRecordsPermissions;
    this.shouldBypassPermissionChecks = shouldBypassPermissionChecks;
    this.manager = manager;
    this.authContext = authContext;
  }

  override createQueryBuilder<U extends T>(
    alias?: string,
    queryRunner?: QueryRunner,
  ): WorkspaceSelectQueryBuilder<U> {
    const queryBuilder = super.createQueryBuilder(
      alias,
      queryRunner,
    ) as unknown as WorkspaceSelectQueryBuilder<U>;

    if (!this.objectRecordsPermissions) {
      throw new Error('Object records permissions are required');
    }

    return new WorkspaceSelectQueryBuilder(
      queryBuilder,
      this.objectRecordsPermissions,
      this.internalContext,
      this.shouldBypassPermissionChecks,
      this.authContext,
      this.featureFlagMap,
    );
  }

  /**
   * FIND METHODS
   */
  override async find(
    options?: FindManyOptions<T>,
    entityManager?: WorkspaceEntityManager,
  ): Promise<T[]> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions(options);
    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };
    const result = await manager.find(
      this.target,
      computedOptions,
      permissionOptions,
    );

    return result;
  }

  override async findBy(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    entityManager?: WorkspaceEntityManager,
  ): Promise<T[]> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions({ where });
    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };
    const result = await manager.findBy(
      this.target,
      computedOptions.where,
      permissionOptions,
    );

    return result;
  }

  override async findAndCount(
    options?: FindManyOptions<T>,
    entityManager?: WorkspaceEntityManager,
  ): Promise<[T[], number]> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions(options);
    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };
    const result = await manager.findAndCount(
      this.target,
      computedOptions,
      permissionOptions,
    );

    return result;
  }

  override async findAndCountBy(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    entityManager?: WorkspaceEntityManager,
  ): Promise<[T[], number]> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions({ where });
    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };
    const result = await manager.findAndCountBy(
      this.target,
      computedOptions.where,
      permissionOptions,
    );

    return result;
  }

  override async findOne(
    options: FindOneOptions<T>,
    entityManager?: WorkspaceEntityManager,
  ): Promise<T | null> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions(options);
    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };
    const result = await manager.findOne(
      this.target,
      computedOptions,
      permissionOptions,
    );

    return result;
  }

  override async findOneBy(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    entityManager?: WorkspaceEntityManager,
  ): Promise<T | null> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions({ where });
    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };
    const result = await manager.findOneBy(
      this.target,
      computedOptions.where,
      permissionOptions,
    );

    return result;
  }

  override async findOneOrFail(
    options: FindOneOptions<T>,
    entityManager?: WorkspaceEntityManager,
  ): Promise<T> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions(options);
    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };
    const result = await manager.findOneOrFail(
      this.target,
      computedOptions,
      permissionOptions,
    );

    return result;
  }

  override async findOneByOrFail(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    entityManager?: WorkspaceEntityManager,
  ): Promise<T> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions({ where });
    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };
    const result = await manager.findOneByOrFail(
      this.target,
      computedOptions.where,
      permissionOptions,
    );

    return result;
  }

  /**
   * SAVE METHODS
   */
  override save<U extends DeepPartialWithNestedRelationFields<T>>(
    entities: U[],
    options: SaveOptions & { reload: false },
    entityManager?: WorkspaceEntityManager,
  ): Promise<T[]>;

  override save<U extends DeepPartialWithNestedRelationFields<T>>(
    entities: U[],
    options?: SaveOptions,
    entityManager?: WorkspaceEntityManager,
  ): Promise<(U & T)[]>;

  override save<U extends DeepPartialWithNestedRelationFields<T>>(
    entity: U,
    options: SaveOptions & { reload: false },
    entityManager?: WorkspaceEntityManager,
  ): Promise<T>;

  override save<U extends DeepPartialWithNestedRelationFields<T>>(
    entity: U,
    options?: SaveOptions,
    entityManager?: WorkspaceEntityManager,
  ): Promise<U & T>;

  override async save<U extends DeepPartialWithNestedRelationFields<T>>(
    entityOrEntities: U | U[],
    options?: SaveOptions | (SaveOptions & { reload: false }),
    entityManager?: WorkspaceEntityManager,
  ): Promise<U | U[]> {
    const manager = entityManager || this.manager;
    let result: U | U[];

    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };

    // Needed because save method has multiple signature, otherwise we will need to do a type assertion
    if (Array.isArray(entityOrEntities)) {
      result = await manager.save(
        this.target,
        entityOrEntities,
        options,
        permissionOptions,
      );
    } else {
      result = await manager.save(
        this.target,
        entityOrEntities,
        options,
        permissionOptions,
      );
    }

    return result;
  }

  /**
   * REMOVE METHODS
   */
  override remove(
    entities: T[],
    options?: RemoveOptions,
    entityManager?: WorkspaceEntityManager,
  ): Promise<T[]>;

  override remove(
    entity: T,
    options?: RemoveOptions,
    entityManager?: WorkspaceEntityManager,
  ): Promise<T>;

  override async remove(
    entityOrEntities: T | T[],
    options?: RemoveOptions,
    entityManager?: WorkspaceEntityManager,
  ): Promise<T | T[]> {
    const manager = entityManager || this.manager;
    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };
    const result = await manager.remove(
      this.target,
      entityOrEntities,
      options,
      permissionOptions,
    );

    return result;
  }

  override async delete(
    criteria:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | ObjectId
      | ObjectId[]
      | FindOptionsWhere<T>,
    entityManager?: WorkspaceEntityManager,
  ): Promise<DeleteResult> {
    const manager = entityManager || this.manager;

    if (typeof criteria === 'object' && 'where' in criteria) {
      criteria = await this.transformOptions(criteria);
    }

    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };

    return manager.delete(this.target, criteria, permissionOptions);
  }

  override softRemove<U extends DeepPartial<T>>(
    entities: U[],
    options: SaveOptions & { reload: false },
    entityManager?: WorkspaceEntityManager,
  ): Promise<T[]>;

  override softRemove<U extends DeepPartial<T>>(
    entities: U[],
    options?: SaveOptions,
    entityManager?: WorkspaceEntityManager,
  ): Promise<(U & T)[]>;

  override softRemove<U extends DeepPartial<T>>(
    entity: U,
    options: SaveOptions & { reload: false },
    entityManager?: WorkspaceEntityManager,
  ): Promise<U>;

  override softRemove<U extends DeepPartial<T>>(
    entity: T,
    options?: SaveOptions,
    entityManager?: WorkspaceEntityManager,
  ): Promise<U & T>;

  override async softRemove<U extends DeepPartial<T>>(
    entityOrEntities: U | U[],
    options?: SaveOptions,
    entityManager?: WorkspaceEntityManager,
  ): Promise<U | U[]> {
    const manager = entityManager || this.manager;
    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };
    let result: U | U[];

    // Needed because save method has multiple signature, otherwise we will need to do a type assertion
    if (Array.isArray(entityOrEntities)) {
      result = await manager.softRemove(
        this.target,
        entityOrEntities,
        options,
        permissionOptions,
      );
    } else {
      result = await manager.softRemove(
        this.target,
        entityOrEntities,
        options,
        permissionOptions,
      );
    }

    return result;
  }

  override async softDelete(
    criteria:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | ObjectId
      | ObjectId[]
      | FindOptionsWhere<T>,
    entityManager?: WorkspaceEntityManager,
  ): Promise<UpdateResult> {
    const manager = entityManager || this.manager;

    if (typeof criteria === 'object' && 'where' in criteria) {
      criteria = await this.transformOptions(criteria);
    }

    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };

    return manager.softDelete(this.target, criteria, permissionOptions);
  }

  /**
   * RECOVERY METHODS
   */
  override recover<U extends DeepPartial<T>>(
    entities: U,
    options: SaveOptions & { reload: false },
    entityManager?: WorkspaceEntityManager,
  ): Promise<U>;

  override recover<U extends DeepPartial<T>>(
    entities: U,
    options?: SaveOptions,
    entityManager?: WorkspaceEntityManager,
  ): Promise<(U & T)[]>;

  override recover<U extends DeepPartial<T>>(
    entity: U,
    options: SaveOptions & { reload: false },
    entityManager?: WorkspaceEntityManager,
  ): Promise<U>;

  override recover<U extends DeepPartial<T>>(
    entity: U,
    options?: SaveOptions,
    entityManager?: WorkspaceEntityManager,
  ): Promise<U & T>;

  override async recover<U extends DeepPartial<T>>(
    entityOrEntities: U | U[],
    options?: SaveOptions,
    entityManager?: WorkspaceEntityManager,
  ): Promise<U | U[]> {
    const manager = entityManager || this.manager;
    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };
    let result: U | U[];

    // Needed because save method has multiple signature, otherwise we will need to do a type assertion
    if (Array.isArray(entityOrEntities)) {
      result = await manager.recover(
        this.target,
        entityOrEntities,
        options,
        permissionOptions,
      );
    } else {
      result = await manager.recover(
        this.target,
        entityOrEntities,
        options,
        permissionOptions,
      );
    }

    return result;
  }

  override async restore(
    criteria:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | ObjectId
      | ObjectId[]
      | FindOptionsWhere<T>,
    entityManager?: WorkspaceEntityManager,
  ): Promise<UpdateResult> {
    const manager = entityManager || this.manager;

    if (typeof criteria === 'object' && 'where' in criteria) {
      criteria = await this.transformOptions(criteria);
    }

    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };

    return manager.restore(this.target, criteria, permissionOptions);
  }

  /**
   * INSERT METHODS
   */
  override async insert(
    entity:
      | QueryDeepPartialEntityWithNestedRelationFields<T>
      | QueryDeepPartialEntityWithNestedRelationFields<T>[],
    entityManager?: WorkspaceEntityManager,
    selectedColumns?: string[],
  ): Promise<InsertResult> {
    const manager = entityManager || this.manager;

    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };

    return manager.insert(
      this.target,
      entity,
      selectedColumns,
      permissionOptions,
    );
  }

  /**
   * UPDATE METHODS
   */
  override async update(
    criteria:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | ObjectId
      | ObjectId[]
      | FindOptionsWhere<T>,
    partialEntity: QueryDeepPartialEntity<T>,
    entityManager?: WorkspaceEntityManager,
    selectedColumns?: string[],
  ): Promise<UpdateResult> {
    const manager = entityManager || this.manager;

    if (typeof criteria === 'object' && 'where' in criteria) {
      criteria = await this.transformOptions(criteria);
    }

    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };

    return manager.update(
      this.target,
      criteria,
      partialEntity,
      permissionOptions,
      selectedColumns,
    );
  }

  // Experimental method to allow batch update and batch event emission
  async updateMany(
    inputs: {
      criteria: string;
      partialEntity: QueryDeepPartialEntity<T>;
    }[],
    entityManager?: WorkspaceEntityManager,
    selectedColumns?: string[],
  ): Promise<UpdateResult> {
    const manager = entityManager || this.manager;

    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };

    const results = await manager.updateMany(
      this.target,
      inputs,
      permissionOptions,
      selectedColumns,
    );

    return results;
  }

  override async upsert(
    entityOrEntities:
      | QueryDeepPartialEntityWithNestedRelationFields<T>
      | QueryDeepPartialEntityWithNestedRelationFields<T>[],
    conflictPathsOrOptions: string[] | UpsertOptions<T>,
    entityManager?: WorkspaceEntityManager,
    selectedColumns: string[] = [],
  ): Promise<InsertResult> {
    const manager = entityManager || this.manager;

    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };

    const result = await manager.upsert(
      this.target,
      entityOrEntities,
      conflictPathsOrOptions,
      permissionOptions,
      selectedColumns,
    );

    return {
      raw: result.raw,
      generatedMaps: result.generatedMaps,
      identifiers: result.identifiers,
    };
  }

  /**
   * EXIST METHODS
   */
  override async exists(
    options?: FindManyOptions<T>,
    entityManager?: WorkspaceEntityManager,
  ): Promise<boolean> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions(options);

    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };

    return manager.exists(this.target, computedOptions, permissionOptions);
  }

  override async existsBy(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    entityManager?: WorkspaceEntityManager,
  ): Promise<boolean> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions({ where });

    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };

    return manager.existsBy(
      this.target,
      computedOptions.where,
      permissionOptions,
    );
  }

  /**
   * COUNT METHODS
   */
  override async count(
    options?: FindManyOptions<T>,
    entityManager?: WorkspaceEntityManager,
  ): Promise<number> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions(options);

    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };

    return manager.count(this.target, computedOptions, permissionOptions);
  }

  override async countBy(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    entityManager?: WorkspaceEntityManager,
  ): Promise<number> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions({ where });

    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };

    return manager.countBy(
      this.target,
      computedOptions.where,
      permissionOptions,
    );
  }

  /**
   * MATH METHODS
   */
  override async sum(
    columnName: PickKeysByType<T, number>,
    where?: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    entityManager?: WorkspaceEntityManager,
  ): Promise<number | null> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions({ where });

    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };

    return manager.sum(
      this.target,
      columnName,
      computedOptions.where,
      permissionOptions,
    );
  }

  override async average(
    columnName: PickKeysByType<T, number>,
    where?: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    entityManager?: WorkspaceEntityManager,
  ): Promise<number | null> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions({ where });

    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };

    return manager.average(
      this.target,
      columnName,
      computedOptions.where,
      permissionOptions,
    );
  }

  override async minimum(
    columnName: PickKeysByType<T, number>,
    where?: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    entityManager?: WorkspaceEntityManager,
  ): Promise<number | null> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions({ where });

    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };

    return manager.minimum(
      this.target,
      columnName,
      computedOptions.where,
      permissionOptions,
    );
  }

  override async maximum(
    columnName: PickKeysByType<T, number>,
    where?: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    entityManager?: WorkspaceEntityManager,
  ): Promise<number | null> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions({ where });

    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };

    return manager.maximum(
      this.target,
      columnName,
      computedOptions.where,
      permissionOptions,
    );
  }

  override async increment(
    conditions: FindOptionsWhere<T>,
    propertyPath: string,
    value: number | string,
    entityManager?: WorkspaceEntityManager,
    selectedColumns?: string[],
  ): Promise<UpdateResult> {
    const manager = entityManager || this.manager;
    const computedConditions = await this.transformOptions({
      where: conditions,
    });

    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };

    return manager.increment(
      this.target,
      computedConditions.where,
      propertyPath,
      value,
      permissionOptions,
      selectedColumns,
    );
  }

  override async decrement(
    conditions: FindOptionsWhere<T>,
    propertyPath: string,
    value: number | string,
    entityManager?: WorkspaceEntityManager,
    selectedColumns?: string[],
  ): Promise<UpdateResult> {
    const manager = entityManager || this.manager;
    const computedConditions = await this.transformOptions({
      where: conditions,
    });

    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };

    return manager.decrement(
      this.target,
      computedConditions.where,
      propertyPath,
      value,
      permissionOptions,
      selectedColumns,
    );
  }

  /**
   * PRELOAD METHOD
   */
  override async preload<U extends DeepPartial<T>>(
    entityLike: U,
    entityManager?: WorkspaceEntityManager,
  ): Promise<T | undefined> {
    const manager = entityManager || this.manager;
    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };

    return manager.preload(this.target, entityLike, permissionOptions);
  }

  /**
   * CLEAR METHOD
   */
  override async clear(entityManager?: WorkspaceEntityManager): Promise<void> {
    const manager = entityManager || this.manager;
    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };

    return manager.clear(this.target, permissionOptions);
  }

  /**
   * DEPRECATED AND RESTRICTED METHODS
   */
  override async query(): Promise<unknown> {
    throw new PermissionsException(
      'Method not allowed.',
      PermissionsExceptionCode.RAW_SQL_NOT_ALLOWED,
    );
  }

  override async findByIds(): Promise<T[]> {
    throw new Error(
      'findByIds is deprecated. Please use findBy with In operator instead.',
    );
  }

  override async findOneById(): Promise<T | null> {
    throw new Error(
      'findOneById is deprecated. Please use findOneBy with id condition instead.',
    );
  }

  override async exist(): Promise<boolean> {
    throw new Error('exist is deprecated. Please use exists method instead.');
  }

  /**
   * PRIVATE METHODS
   */
  private async getObjectMetadataFromTarget() {
    return getObjectMetadataFromEntityTarget(this.target, this.internalContext);
  }

  private async transformOptions<
    U extends FindManyOptions<T> | FindOneOptions<T> | undefined,
  >(options: U): Promise<U> {
    if (!options) {
      return options;
    }

    const transformedOptions = { ...options };

    transformedOptions.where = await this.formatData(options.where);

    if (options.withDeleted) {
      transformedOptions.withDeleted = true;
    }

    return transformedOptions;
  }

  private async formatData<T>(data: T): Promise<T> {
    const objectMetadata = await this.getObjectMetadataFromTarget();

    return formatData(data, objectMetadata) as T;
  }
}
