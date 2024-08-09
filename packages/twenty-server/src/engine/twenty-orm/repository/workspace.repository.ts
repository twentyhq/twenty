import { isPlainObject } from '@nestjs/common/utils/shared.utils';

import {
  DeepPartial,
  DeleteResult,
  EntityManager,
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
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { UpsertOptions } from 'typeorm/repository/UpsertOptions';
import { PickKeysByType } from 'typeorm/common/PickKeysByType';

import { WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { compositeTypeDefintions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceEntitiesStorage } from 'src/engine/twenty-orm/storage/workspace-entities.storage';
import { computeRelationType } from 'src/engine/twenty-orm/utils/compute-relation-type.util';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';

export class WorkspaceRepository<
  Entity extends ObjectLiteral,
> extends Repository<Entity> {
  private readonly internalContext: WorkspaceInternalContext;

  constructor(
    internalContext: WorkspaceInternalContext,
    target: EntityTarget<Entity>,
    manager: EntityManager,
    queryRunner?: QueryRunner,
  ) {
    super(target, manager, queryRunner);
    this.internalContext = internalContext;
  }

  /**
   * FIND METHODS
   */
  override async find(
    options?: FindManyOptions<Entity>,
    entityManager?: EntityManager,
  ): Promise<Entity[]> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions(options);
    const result = await manager.find(this.target, computedOptions);
    const formattedResult = await this.formatResult(result);

    return formattedResult;
  }

  override async findBy(
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    entityManager?: EntityManager,
  ): Promise<Entity[]> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions({ where });
    const result = await manager.findBy(this.target, computedOptions.where);
    const formattedResult = await this.formatResult(result);

    return formattedResult;
  }

  override async findAndCount(
    options?: FindManyOptions<Entity>,
    entityManager?: EntityManager,
  ): Promise<[Entity[], number]> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions(options);
    const result = await manager.findAndCount(this.target, computedOptions);
    const formattedResult = await this.formatResult(result);

    return formattedResult;
  }

  override async findAndCountBy(
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    entityManager?: EntityManager,
  ): Promise<[Entity[], number]> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions({ where });
    const result = await manager.findAndCountBy(
      this.target,
      computedOptions.where,
    );
    const formattedResult = await this.formatResult(result);

    return formattedResult;
  }

  override async findOne(
    options: FindOneOptions<Entity>,
    entityManager?: EntityManager,
  ): Promise<Entity | null> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions(options);
    const result = await manager.findOne(this.target, computedOptions);
    const formattedResult = await this.formatResult(result);

    return formattedResult;
  }

  override async findOneBy(
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    entityManager?: EntityManager,
  ): Promise<Entity | null> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions({ where });
    const result = await manager.findOneBy(this.target, computedOptions.where);
    const formattedResult = await this.formatResult(result);

    return formattedResult;
  }

  override async findOneOrFail(
    options: FindOneOptions<Entity>,
    entityManager?: EntityManager,
  ): Promise<Entity> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions(options);
    const result = await manager.findOneOrFail(this.target, computedOptions);
    const formattedResult = await this.formatResult(result);

    return formattedResult;
  }

  override async findOneByOrFail(
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    entityManager?: EntityManager,
  ): Promise<Entity> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions({ where });
    const result = await manager.findOneByOrFail(
      this.target,
      computedOptions.where,
    );
    const formattedResult = await this.formatResult(result);

    return formattedResult;
  }

  /**
   * SAVE METHODS
   */
  override save<T extends DeepPartial<Entity>>(
    entities: T[],
    options: SaveOptions & { reload: false },
    entityManager?: EntityManager,
  ): Promise<T[]>;

  override save<T extends DeepPartial<Entity>>(
    entities: T[],
    options?: SaveOptions,
    entityManager?: EntityManager,
  ): Promise<(T & Entity)[]>;

  override save<T extends DeepPartial<Entity>>(
    entity: T,
    options: SaveOptions & { reload: false },
    entityManager?: EntityManager,
  ): Promise<T>;

  override save<T extends DeepPartial<Entity>>(
    entity: T,
    options?: SaveOptions,
    entityManager?: EntityManager,
  ): Promise<T & Entity>;

  override async save<T extends DeepPartial<Entity>>(
    entityOrEntities: T | T[],
    options?: SaveOptions,
    entityManager?: EntityManager,
  ): Promise<T | T[]> {
    const manager = entityManager || this.manager;
    const formattedEntityOrEntities = await this.formatData(entityOrEntities);
    let result: T | T[];

    // Needed becasuse save method has multiple signature, otherwise we will need to do a type assertion
    if (Array.isArray(formattedEntityOrEntities)) {
      result = await manager.save(
        this.target,
        formattedEntityOrEntities,
        options,
      );
    } else {
      result = await manager.save(
        this.target,
        formattedEntityOrEntities,
        options,
      );
    }

    const formattedResult = await this.formatResult(result);

    return formattedResult;
  }

  /**
   * REMOVE METHODS
   */
  override remove(
    entities: Entity[],
    options?: RemoveOptions,
    entityManager?: EntityManager,
  ): Promise<Entity[]>;

  override remove(
    entity: Entity,
    options?: RemoveOptions,
    entityManager?: EntityManager,
  ): Promise<Entity>;

  override async remove(
    entityOrEntities: Entity | Entity[],
    options?: RemoveOptions,
    entityManager?: EntityManager,
  ): Promise<Entity | Entity[]> {
    const manager = entityManager || this.manager;
    const formattedEntityOrEntities = await this.formatData(entityOrEntities);
    const result = await manager.remove(
      this.target,
      formattedEntityOrEntities,
      options,
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
      | FindOptionsWhere<Entity>,
    entityManager?: EntityManager,
  ): Promise<DeleteResult> {
    const manager = entityManager || this.manager;

    if (typeof criteria === 'object' && 'where' in criteria) {
      criteria = await this.transformOptions(criteria);
    }

    return manager.delete(this.target, criteria);
  }

  override softRemove<T extends DeepPartial<Entity>>(
    entities: T[],
    options: SaveOptions & { reload: false },
    entityManager?: EntityManager,
  ): Promise<T[]>;

  override softRemove<T extends DeepPartial<Entity>>(
    entities: T[],
    options?: SaveOptions,
    entityManager?: EntityManager,
  ): Promise<(T & Entity)[]>;

  override softRemove<T extends DeepPartial<Entity>>(
    entity: T,
    options: SaveOptions & { reload: false },
    entityManager?: EntityManager,
  ): Promise<T>;

  override softRemove<T extends DeepPartial<Entity>>(
    entity: T,
    options?: SaveOptions,
    entityManager?: EntityManager,
  ): Promise<T & Entity>;

  override async softRemove<T extends DeepPartial<Entity>>(
    entityOrEntities: T | T[],
    options?: SaveOptions,
    entityManager?: EntityManager,
  ): Promise<T | T[]> {
    const manager = entityManager || this.manager;
    const formattedEntityOrEntities = await this.formatData(entityOrEntities);
    let result: T | T[];

    // Needed becasuse save method has multiple signature, otherwise we will need to do a type assertion
    if (Array.isArray(formattedEntityOrEntities)) {
      result = await manager.softRemove(
        this.target,
        formattedEntityOrEntities,
        options,
      );
    } else {
      result = await manager.softRemove(
        this.target,
        formattedEntityOrEntities,
        options,
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
      | FindOptionsWhere<Entity>,
    entityManager?: EntityManager,
  ): Promise<UpdateResult> {
    const manager = entityManager || this.manager;

    if (typeof criteria === 'object' && 'where' in criteria) {
      criteria = await this.transformOptions(criteria);
    }

    return manager.softDelete(this.target, criteria);
  }

  /**
   * RECOVERY METHODS
   */
  override recover<T extends DeepPartial<Entity>>(
    entities: T[],
    options: SaveOptions & { reload: false },
    entityManager?: EntityManager,
  ): Promise<T[]>;

  override recover<T extends DeepPartial<Entity>>(
    entities: T[],
    options?: SaveOptions,
    entityManager?: EntityManager,
  ): Promise<(T & Entity)[]>;

  override recover<T extends DeepPartial<Entity>>(
    entity: T,
    options: SaveOptions & { reload: false },
    entityManager?: EntityManager,
  ): Promise<T>;

  override recover<T extends DeepPartial<Entity>>(
    entity: T,
    options?: SaveOptions,
    entityManager?: EntityManager,
  ): Promise<T & Entity>;

  override async recover<T extends DeepPartial<Entity>>(
    entityOrEntities: T | T[],
    options?: SaveOptions,
    entityManager?: EntityManager,
  ): Promise<T | T[]> {
    const manager = entityManager || this.manager;
    const formattedEntityOrEntities = await this.formatData(entityOrEntities);
    let result: T | T[];

    // Needed becasuse save method has multiple signature, otherwise we will need to do a type assertion
    if (Array.isArray(formattedEntityOrEntities)) {
      result = await manager.recover(
        this.target,
        formattedEntityOrEntities,
        options,
      );
    } else {
      result = await manager.recover(
        this.target,
        formattedEntityOrEntities,
        options,
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
      | FindOptionsWhere<Entity>,
    entityManager?: EntityManager,
  ): Promise<UpdateResult> {
    const manager = entityManager || this.manager;

    if (typeof criteria === 'object' && 'where' in criteria) {
      criteria = await this.transformOptions(criteria);
    }

    return manager.restore(this.target, criteria);
  }

  /**
   * INSERT METHODS
   */
  override async insert(
    entity: QueryDeepPartialEntity<Entity> | QueryDeepPartialEntity<Entity>[],
    entityManager?: EntityManager,
  ): Promise<InsertResult> {
    const manager = entityManager || this.manager;
    const formatedEntity = await this.formatData(entity);
    const result = await manager.insert(this.target, formatedEntity);
    const formattedResult = await this.formatResult(result);

    return formattedResult;
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
      | FindOptionsWhere<Entity>,
    partialEntity: QueryDeepPartialEntity<Entity>,
    entityManager?: EntityManager,
  ): Promise<UpdateResult> {
    const manager = entityManager || this.manager;

    if (typeof criteria === 'object' && 'where' in criteria) {
      criteria = await this.transformOptions(criteria);
    }

    return manager.update(this.target, criteria, partialEntity);
  }

  override async upsert(
    entityOrEntities:
      | QueryDeepPartialEntity<Entity>
      | QueryDeepPartialEntity<Entity>[],
    conflictPathsOrOptions: string[] | UpsertOptions<Entity>,
    entityManager?: EntityManager,
  ): Promise<InsertResult> {
    const manager = entityManager || this.manager;

    const formattedEntityOrEntities = await this.formatData(entityOrEntities);

    return manager.upsert(
      this.target,
      formattedEntityOrEntities,
      conflictPathsOrOptions,
    );
  }

  /**
   * EXIST METHODS
   */
  override async exists(
    options?: FindManyOptions<Entity>,
    entityManager?: EntityManager,
  ): Promise<boolean> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions(options);

    return manager.exists(this.target, computedOptions);
  }

  override async existsBy(
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    entityManager?: EntityManager,
  ): Promise<boolean> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions({ where });

    return manager.existsBy(this.target, computedOptions.where);
  }

  /**
   * COUNT METHODS
   */
  override async count(
    options?: FindManyOptions<Entity>,
    entityManager?: EntityManager,
  ): Promise<number> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions(options);

    return manager.count(this.target, computedOptions);
  }

  override async countBy(
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    entityManager?: EntityManager,
  ): Promise<number> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions({ where });

    return manager.countBy(this.target, computedOptions.where);
  }

  /**
   * MATH METHODS
   */
  override async sum(
    columnName: PickKeysByType<Entity, number>,
    where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    entityManager?: EntityManager,
  ): Promise<number | null> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions({ where });

    return manager.sum(this.target, columnName, computedOptions.where);
  }

  override async average(
    columnName: PickKeysByType<Entity, number>,
    where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    entityManager?: EntityManager,
  ): Promise<number | null> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions({ where });

    return manager.average(this.target, columnName, computedOptions.where);
  }

  override async minimum(
    columnName: PickKeysByType<Entity, number>,
    where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    entityManager?: EntityManager,
  ): Promise<number | null> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions({ where });

    return manager.minimum(this.target, columnName, computedOptions.where);
  }

  override async maximum(
    columnName: PickKeysByType<Entity, number>,
    where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    entityManager?: EntityManager,
  ): Promise<number | null> {
    const manager = entityManager || this.manager;
    const computedOptions = await this.transformOptions({ where });

    return manager.maximum(this.target, columnName, computedOptions.where);
  }

  override async increment(
    conditions: FindOptionsWhere<Entity>,
    propertyPath: string,
    value: number | string,
    entityManager?: EntityManager,
  ): Promise<UpdateResult> {
    const manager = entityManager || this.manager;
    const computedConditions = await this.transformOptions({
      where: conditions,
    });

    return manager.increment(
      this.target,
      computedConditions.where,
      propertyPath,
      value,
    );
  }

  override async decrement(
    conditions: FindOptionsWhere<Entity>,
    propertyPath: string,
    value: number | string,
    entityManager?: EntityManager,
  ): Promise<UpdateResult> {
    const manager = entityManager || this.manager;
    const computedConditions = await this.transformOptions({
      where: conditions,
    });

    return manager.decrement(
      this.target,
      computedConditions.where,
      propertyPath,
      value,
    );
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

    const objectMetadata =
      await this.internalContext.workspaceCacheStorage.getObjectMetadata(
        this.internalContext.workspaceId,
        (objectMetadata) => objectMetadata.nameSingular === objectMetadataName,
      );

    if (!objectMetadata) {
      const objectMetadataCollection =
        await this.internalContext.workspaceCacheStorage.getObjectMetadataCollection(
          this.internalContext.workspaceId,
        );

      throw new Error(
        `Object metadata for object "${objectMetadataName}" is missing ` +
          `in workspace "${this.internalContext.workspaceId}" ` +
          `with object metadata collection length: ${objectMetadataCollection?.length}`,
      );
    }

    return objectMetadata;
  }

  private async getCompositeFieldMetadataCollection(
    objectMetadata: ObjectMetadataEntity,
  ) {
    const compositeFieldMetadataCollection = objectMetadata.fields.filter(
      (fieldMetadata) => isCompositeFieldMetadataType(fieldMetadata.type),
    );

    return compositeFieldMetadataCollection;
  }

  private async transformOptions<
    T extends FindManyOptions<Entity> | FindOneOptions<Entity> | undefined,
  >(options: T): Promise<T> {
    if (!options) {
      return options;
    }

    const transformedOptions = { ...options };

    transformedOptions.where = await this.formatData(options.where);

    return transformedOptions;
  }

  private async formatData<T>(data: T): Promise<T> {
    if (!data) {
      return data;
    }

    if (Array.isArray(data)) {
      return Promise.all(
        data.map((item) => this.formatData(item)),
      ) as Promise<T>;
    }

    const objectMetadata = await this.getObjectMetadataFromTarget();

    const compositeFieldMetadataCollection =
      await this.getCompositeFieldMetadataCollection(objectMetadata);
    const compositeFieldMetadataMap = new Map(
      compositeFieldMetadataCollection.map((fieldMetadata) => [
        fieldMetadata.name,
        fieldMetadata,
      ]),
    );
    const newData: object = {};

    for (const [key, value] of Object.entries(data)) {
      const fieldMetadata = compositeFieldMetadataMap.get(key);

      if (!fieldMetadata) {
        if (isPlainObject(value)) {
          newData[key] = await this.formatData(value);
        } else {
          newData[key] = value;
        }
        continue;
      }

      const compositeType = compositeTypeDefintions.get(fieldMetadata.type);

      if (!compositeType) {
        continue;
      }

      for (const compositeProperty of compositeType.properties) {
        const compositeKey = computeCompositeColumnName(
          fieldMetadata.name,
          compositeProperty,
        );
        const value = data?.[key]?.[compositeProperty.name];

        if (value === undefined || value === null) {
          continue;
        }

        newData[compositeKey] = data[key][compositeProperty.name];
      }
    }

    return newData as T;
  }

  private async formatResult<T>(
    data: T,
    objectMetadata?: ObjectMetadataEntity,
  ): Promise<T> {
    objectMetadata ??= await this.getObjectMetadataFromTarget();

    if (!data) {
      return data;
    }

    if (Array.isArray(data)) {
      // If the data is an array, map each item in the array, format result is a promise
      return Promise.all(
        data.map((item) => this.formatResult(item, objectMetadata)),
      ) as Promise<T>;
    }

    if (!isPlainObject(data)) {
      return data;
    }

    if (!objectMetadata) {
      throw new Error('Object metadata is missing');
    }

    const compositeFieldMetadataCollection =
      await this.getCompositeFieldMetadataCollection(objectMetadata);

    const compositeFieldMetadataMap = new Map(
      compositeFieldMetadataCollection.flatMap((fieldMetadata) => {
        const compositeType = compositeTypeDefintions.get(fieldMetadata.type);

        if (!compositeType) return [];

        // Map each composite property to a [key, value] pair
        return compositeType.properties.map((compositeProperty) => [
          computeCompositeColumnName(fieldMetadata.name, compositeProperty),
          {
            parentField: fieldMetadata.name,
            ...compositeProperty,
          },
        ]);
      }),
    );

    const relationMetadataMap = new Map(
      objectMetadata.fields
        .filter(({ type }) => isRelationFieldMetadataType(type))
        .map((fieldMetadata) => [
          fieldMetadata.name,
          {
            relationMetadata:
              fieldMetadata.fromRelationMetadata ??
              fieldMetadata.toRelationMetadata,
            relationType: computeRelationType(
              fieldMetadata,
              fieldMetadata.fromRelationMetadata ??
                fieldMetadata.toRelationMetadata,
            ),
          },
        ]),
    );
    const newData: object = {};

    for (const [key, value] of Object.entries(data)) {
      const compositePropertyArgs = compositeFieldMetadataMap.get(key);
      const { relationMetadata, relationType } =
        relationMetadataMap.get(key) ?? {};

      if (!compositePropertyArgs && !relationMetadata) {
        if (isPlainObject(value)) {
          newData[key] = await this.formatResult(value);
        } else {
          newData[key] = value;
        }
        continue;
      }

      if (relationMetadata) {
        const toObjectMetadata =
          await this.internalContext.workspaceCacheStorage.getObjectMetadata(
            relationMetadata.workspaceId,
            (objectMetadata) =>
              objectMetadata.id === relationMetadata.toObjectMetadataId,
          );

        const fromObjectMetadata =
          await this.internalContext.workspaceCacheStorage.getObjectMetadata(
            relationMetadata.workspaceId,
            (objectMetadata) =>
              objectMetadata.id === relationMetadata.fromObjectMetadataId,
          );

        if (!toObjectMetadata) {
          throw new Error(
            `Object metadata for object metadataId "${relationMetadata.toObjectMetadataId}" is missing`,
          );
        }

        if (!fromObjectMetadata) {
          throw new Error(
            `Object metadata for object metadataId "${relationMetadata.fromObjectMetadataId}" is missing`,
          );
        }

        newData[key] = await this.formatResult(
          value,
          relationType === 'one-to-many'
            ? toObjectMetadata
            : fromObjectMetadata,
        );
        continue;
      }

      if (!compositePropertyArgs) {
        continue;
      }

      const { parentField, ...compositeProperty } = compositePropertyArgs;

      if (!newData[parentField]) {
        newData[parentField] = {};
      }

      newData[parentField][compositeProperty.name] = value;
    }

    return newData as T;
  }
}
