import { ObjectRecordsPermissions } from 'twenty-shared/types';
import {
  DeepPartial,
  DeleteResult,
  EntitySchema,
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

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { WorkspaceEntitiesStorage } from 'src/engine/twenty-orm/storage/workspace-entities.storage';
import { formatData } from 'src/engine/twenty-orm/utils/format-data.util';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';

export class WorkspaceRepository<
  T extends ObjectLiteral,
> extends Repository<T> {
  private readonly internalContext: WorkspaceInternalContext;
  private shouldBypassPermissionChecks: boolean;
  private featureFlagMap: FeatureFlagMap;
  private objectRecordsPermissions?: ObjectRecordsPermissions;
  declare manager: WorkspaceEntityManager;

  constructor(
    internalContext: WorkspaceInternalContext,
    target: EntityTarget<T>,
    manager: WorkspaceEntityManager,
    featureFlagMap: FeatureFlagMap,
    queryRunner?: QueryRunner,
    objectRecordsPermissions?: ObjectRecordsPermissions,
    shouldBypassPermissionChecks = false,
  ) {
    super(target, manager, queryRunner);
    this.internalContext = internalContext;
    this.featureFlagMap = featureFlagMap;
    this.objectRecordsPermissions = objectRecordsPermissions;
    this.shouldBypassPermissionChecks = shouldBypassPermissionChecks;
    this.manager = manager;
  }

  override createQueryBuilder<U extends T>(
    alias?: string,
    queryRunner?: QueryRunner,
  ): WorkspaceSelectQueryBuilder<U> {
    const queryBuilder = super.createQueryBuilder(
      alias,
      queryRunner,
    ) as unknown as WorkspaceSelectQueryBuilder<U>;
    const isPermissionsV2Enabled =
      this.featureFlagMap[FeatureFlagKey.IS_PERMISSIONS_V2_ENABLED];

    if (!isPermissionsV2Enabled) {
      return queryBuilder;
    } else {
      if (!this.objectRecordsPermissions) {
        throw new Error('Object records permissions are required');
      }

      return new WorkspaceSelectQueryBuilder(
        queryBuilder,
        this.objectRecordsPermissions,
        this.internalContext,
        this.shouldBypassPermissionChecks,
      );
    }
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
    const formattedResult = await this.formatResult(result);

    return formattedResult;
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
    const formattedResult = await this.formatResult(result);

    return formattedResult;
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
    const formattedResult = await this.formatResult(result);

    return formattedResult;
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
    const formattedResult = await this.formatResult(result);

    return formattedResult;
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
    const formattedResult = await this.formatResult(result);

    return formattedResult;
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
    const formattedResult = await this.formatResult(result);

    return formattedResult;
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
    const formattedResult = await this.formatResult(result);

    return formattedResult;
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
    const formattedResult = await this.formatResult(result);

    return formattedResult;
  }

  /**
   * SAVE METHODS
   */
  override save<U extends DeepPartial<T>>(
    entities: U[],
    options: SaveOptions & { reload: false },
    entityManager?: WorkspaceEntityManager,
  ): Promise<T[]>;

  override save<U extends DeepPartial<T>>(
    entities: U[],
    options?: SaveOptions,
    entityManager?: WorkspaceEntityManager,
  ): Promise<(U & T)[]>;

  override save<U extends DeepPartial<T>>(
    entity: U,
    options: SaveOptions & { reload: false },
    entityManager?: WorkspaceEntityManager,
  ): Promise<T>;

  override save<U extends DeepPartial<T>>(
    entity: U,
    options?: SaveOptions,
    entityManager?: WorkspaceEntityManager,
  ): Promise<U & T>;

  override async save<U extends DeepPartial<T>>(
    entityOrEntities: U | U[],
    options?: SaveOptions | (SaveOptions & { reload: false }),
    entityManager?: WorkspaceEntityManager,
  ): Promise<U | U[]> {
    const manager = entityManager || this.manager;
    const formattedEntityOrEntities = await this.formatData(entityOrEntities);
    let result: U | U[];

    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };

    // Needed because save method has multiple signature, otherwise we will need to do a type assertion
    if (Array.isArray(formattedEntityOrEntities)) {
      result = await manager.save(
        this.target,
        formattedEntityOrEntities,
        options,
        permissionOptions,
      );
    } else {
      result = await manager.save(
        this.target,
        formattedEntityOrEntities,
        options,
        permissionOptions,
      );
    }

    const formattedResult = await this.formatResult(result);

    return formattedResult;
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
    const formattedEntityOrEntities = await this.formatData(entityOrEntities);
    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };
    const result = await manager.remove(
      this.target,
      formattedEntityOrEntities,
      options,
      permissionOptions,
    );

    const formattedResult = await this.formatResult(result);

    return formattedResult;
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
    const formattedEntityOrEntities = await this.formatData(entityOrEntities);
    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };
    let result: U | U[];

    // Needed because save method has multiple signature, otherwise we will need to do a type assertion
    if (Array.isArray(formattedEntityOrEntities)) {
      result = await manager.softRemove(
        this.target,
        formattedEntityOrEntities,
        options,
        permissionOptions,
      );
    } else {
      result = await manager.softRemove(
        this.target,
        formattedEntityOrEntities,
        options,
        permissionOptions,
      );
    }

    const formattedResult = await this.formatResult(result);

    return formattedResult;
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
    const formattedEntityOrEntities = await this.formatData(entityOrEntities);
    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };
    let result: U | U[];

    // Needed because save method has multiple signature, otherwise we will need to do a type assertion
    if (Array.isArray(formattedEntityOrEntities)) {
      result = await manager.recover(
        this.target,
        formattedEntityOrEntities,
        options,
        permissionOptions,
      );
    } else {
      result = await manager.recover(
        this.target,
        formattedEntityOrEntities,
        options,
        permissionOptions,
      );
    }

    const formattedResult = await this.formatResult(result);

    return formattedResult;
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
    entity: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[],
    entityManager?: WorkspaceEntityManager,
  ): Promise<InsertResult> {
    const manager = entityManager || this.manager;

    const formattedEntity = await this.formatData(entity);
    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };
    const result = await manager.insert(
      this.target,
      formattedEntity,
      permissionOptions,
    );
    const formattedResult = await this.formatResult(result.generatedMaps);

    return {
      raw: result.raw,
      generatedMaps: formattedResult,
      identifiers: result.identifiers,
    };
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
    );
  }

  override async upsert(
    entityOrEntities: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[],
    conflictPathsOrOptions: string[] | UpsertOptions<T>,
    entityManager?: WorkspaceEntityManager,
  ): Promise<InsertResult> {
    const manager = entityManager || this.manager;

    const formattedEntityOrEntities = await this.formatData(entityOrEntities);

    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };

    const result = await manager.upsert(
      this.target,
      formattedEntityOrEntities,
      conflictPathsOrOptions,
      permissionOptions,
    );

    const formattedResult = await this.formatResult(result.generatedMaps);

    return {
      raw: result.raw,
      generatedMaps: formattedResult,
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
    );
  }

  override async decrement(
    conditions: FindOptionsWhere<T>,
    propertyPath: string,
    value: number | string,
    entityManager?: WorkspaceEntityManager,
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
    const formattedEntityLike = await this.formatData(entityLike);
    const permissionOptions = {
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      objectRecordsPermissions: this.objectRecordsPermissions,
    };

    return manager.preload(this.target, formattedEntityLike, permissionOptions);
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
    const objectMetadataName =
      typeof this.target === 'string'
        ? this.target
        : WorkspaceEntitiesStorage.getObjectMetadataName(
            this.internalContext.workspaceId,
            this.target as EntitySchema,
          );

    if (!objectMetadataName) {
      throw new Error('Object metadata name is missing');
    }

    const objectMetadata = getObjectMetadataMapItemByNameSingular(
      this.internalContext.objectMetadataMaps,
      objectMetadataName,
    );

    if (!objectMetadata) {
      throw new Error(
        `Object metadata for object "${objectMetadataName}" is missing ` +
          `in workspace "${this.internalContext.workspaceId}" ` +
          `with object metadata collection length: ${
            Object.keys(
              this.internalContext.objectMetadataMaps.idByNameSingular,
            ).length
          }`,
      );
    }

    return objectMetadata;
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

  async formatResult<T>(
    data: T,
    objectMetadata?: ObjectMetadataItemWithFieldMaps,
  ): Promise<T> {
    objectMetadata ??= await this.getObjectMetadataFromTarget();

    const objectMetadataMaps = this.internalContext.objectMetadataMaps;

    return formatResult(data, objectMetadata, objectMetadataMaps) as T;
  }
}
