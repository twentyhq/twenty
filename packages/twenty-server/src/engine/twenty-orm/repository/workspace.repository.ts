import {
  DeepPartial,
  DeleteResult,
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  InsertResult,
  ObjectId,
  ObjectLiteral,
  RemoveOptions,
  Repository,
  SaveOptions,
  UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { UpsertOptions } from 'typeorm/repository/UpsertOptions';
import { PickKeysByType } from 'typeorm/common/PickKeysByType';

import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { ObjectLiteralStorage } from 'src/engine/twenty-orm/storage/object-literal.storage';
import { compositeTypeDefintions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { isPlainObject } from 'src/utils/is-plain-object';

export class WorkspaceRepository<
  Entity extends ObjectLiteral,
> extends Repository<Entity> {
  /**
   * FIND METHODS
   */
  override async find(
    options?: FindManyOptions<Entity>,
    entityManager?: EntityManager,
  ): Promise<Entity[]> {
    const manager = entityManager || this.manager;
    const computedOptions = this.transformOptions(options);
    const result = await manager.find(this.target, computedOptions);
    const formattedResult = this.formatResult(result);

    return formattedResult;
  }

  override async findBy(
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    entityManager?: EntityManager,
  ): Promise<Entity[]> {
    const manager = entityManager || this.manager;
    const computedOptions = this.transformOptions({ where });
    const result = await manager.findBy(this.target, computedOptions.where);
    const formattedResult = this.formatResult(result);

    return formattedResult;
  }

  override async findAndCount(
    options?: FindManyOptions<Entity>,
    entityManager?: EntityManager,
  ): Promise<[Entity[], number]> {
    const manager = entityManager || this.manager;
    const computedOptions = this.transformOptions(options);
    const result = await manager.findAndCount(this.target, computedOptions);
    const formattedResult = this.formatResult(result);

    return formattedResult;
  }

  override async findAndCountBy(
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    entityManager?: EntityManager,
  ): Promise<[Entity[], number]> {
    const manager = entityManager || this.manager;
    const computedOptions = this.transformOptions({ where });
    const result = await manager.findAndCountBy(
      this.target,
      computedOptions.where,
    );
    const formattedResult = this.formatResult(result);

    return formattedResult;
  }

  override async findOne(
    options: FindOneOptions<Entity>,
    entityManager?: EntityManager,
  ): Promise<Entity | null> {
    const manager = entityManager || this.manager;
    const computedOptions = this.transformOptions(options);
    const result = await manager.findOne(this.target, computedOptions);
    const formattedResult = this.formatResult(result);

    return formattedResult;
  }

  override async findOneBy(
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    entityManager?: EntityManager,
  ): Promise<Entity | null> {
    const manager = entityManager || this.manager;
    const computedOptions = this.transformOptions({ where });
    const result = await manager.findOneBy(this.target, computedOptions.where);
    const formattedResult = this.formatResult(result);

    return formattedResult;
  }

  override async findOneOrFail(
    options: FindOneOptions<Entity>,
    entityManager?: EntityManager,
  ): Promise<Entity> {
    const manager = entityManager || this.manager;
    const computedOptions = this.transformOptions(options);
    const result = await manager.findOneOrFail(this.target, computedOptions);
    const formattedResult = this.formatResult(result);

    return formattedResult;
  }

  override async findOneByOrFail(
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    entityManager?: EntityManager,
  ): Promise<Entity> {
    const manager = entityManager || this.manager;
    const computedOptions = this.transformOptions({ where });
    const result = await manager.findOneByOrFail(
      this.target,
      computedOptions.where,
    );
    const formattedResult = this.formatResult(result);

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
    const formattedEntityOrEntities = this.formatData(entityOrEntities);
    const result = await manager.save(
      this.target,
      formattedEntityOrEntities as any,
      options,
    );

    const formattedResult = this.formatResult(result);

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
    const formattedEntityOrEntities = this.formatData(entityOrEntities);
    const result = await manager.remove(
      this.target,
      formattedEntityOrEntities,
      options,
    );
    const formattedResult = this.formatResult(result);

    return formattedResult;
  }

  override delete(
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
      criteria = this.transformOptions(criteria);
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
    const formattedEntityOrEntities = this.formatData(entityOrEntities);
    const result = await manager.softRemove(
      this.target,
      formattedEntityOrEntities as any,
      options,
    );
    const formattedResult = this.formatResult(result);

    return formattedResult;
  }

  override softDelete(
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
      criteria = this.transformOptions(criteria);
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
    const formattedEntityOrEntities = this.formatData(entityOrEntities);
    const result = await manager.recover(
      this.target,
      formattedEntityOrEntities as any,
      options,
    );
    const formattedResult = this.formatResult(result);

    return formattedResult;
  }

  override restore(
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
      criteria = this.transformOptions(criteria);
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
    const formatedEntity = this.formatData(entity);
    const result = await manager.insert(this.target, formatedEntity);
    const formattedResult = this.formatResult(result);

    return formattedResult;
  }

  /**
   * UPDATE METHODS
   */
  override update(
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
      criteria = this.transformOptions(criteria);
    }

    return manager.update(this.target, criteria, partialEntity);
  }

  override upsert(
    entityOrEntities:
      | QueryDeepPartialEntity<Entity>
      | QueryDeepPartialEntity<Entity>[],
    conflictPathsOrOptions: string[] | UpsertOptions<Entity>,
    entityManager?: EntityManager,
  ): Promise<InsertResult> {
    const manager = entityManager || this.manager;

    const formattedEntityOrEntities = this.formatData(entityOrEntities);

    return manager.upsert(
      this.target,
      formattedEntityOrEntities,
      conflictPathsOrOptions,
    );
  }

  /**
   * EXIST METHODS
   */
  override exists(
    options?: FindManyOptions<Entity>,
    entityManager?: EntityManager,
  ): Promise<boolean> {
    const manager = entityManager || this.manager;
    const computedOptions = this.transformOptions(options);

    return manager.exists(this.target, computedOptions);
  }

  override existsBy(
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    entityManager?: EntityManager,
  ): Promise<boolean> {
    const manager = entityManager || this.manager;
    const computedOptions = this.transformOptions({ where });

    return manager.existsBy(this.target, computedOptions.where);
  }

  /**
   * COUNT METHODS
   */
  override count(
    options?: FindManyOptions<Entity>,
    entityManager?: EntityManager,
  ): Promise<number> {
    const manager = entityManager || this.manager;
    const computedOptions = this.transformOptions(options);

    return manager.count(this.target, computedOptions);
  }

  override countBy(
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    entityManager?: EntityManager,
  ): Promise<number> {
    const manager = entityManager || this.manager;
    const computedOptions = this.transformOptions({ where });

    return manager.countBy(this.target, computedOptions.where);
  }

  /**
   * MATH METHODS
   */
  override sum(
    columnName: PickKeysByType<Entity, number>,
    where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    entityManager?: EntityManager,
  ): Promise<number | null> {
    const manager = entityManager || this.manager;
    const computedOptions = this.transformOptions({ where });

    return manager.sum(this.target, columnName, computedOptions.where);
  }

  override average(
    columnName: PickKeysByType<Entity, number>,
    where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    entityManager?: EntityManager,
  ): Promise<number | null> {
    const manager = entityManager || this.manager;
    const computedOptions = this.transformOptions({ where });

    return manager.average(this.target, columnName, computedOptions.where);
  }

  override minimum(
    columnName: PickKeysByType<Entity, number>,
    where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    entityManager?: EntityManager,
  ): Promise<number | null> {
    const manager = entityManager || this.manager;
    const computedOptions = this.transformOptions({ where });

    return manager.minimum(this.target, columnName, computedOptions.where);
  }

  override maximum(
    columnName: PickKeysByType<Entity, number>,
    where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    entityManager?: EntityManager,
  ): Promise<number | null> {
    const manager = entityManager || this.manager;
    const computedOptions = this.transformOptions({ where });

    return manager.maximum(this.target, columnName, computedOptions.where);
  }

  override increment(
    conditions: FindOptionsWhere<Entity>,
    propertyPath: string,
    value: number | string,
    entityManager?: EntityManager,
  ): Promise<UpdateResult> {
    const manager = entityManager || this.manager;
    const computedConditions = this.transformOptions({ where: conditions });

    return manager.increment(
      this.target,
      computedConditions.where,
      propertyPath,
      value,
    );
  }

  override decrement(
    conditions: FindOptionsWhere<Entity>,
    propertyPath: string,
    value: number | string,
    entityManager?: EntityManager,
  ): Promise<UpdateResult> {
    const manager = entityManager || this.manager;
    const computedConditions = this.transformOptions({ where: conditions });

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
  private getCompositeFieldMetadataArgs() {
    const objectLiteral = ObjectLiteralStorage.getObjectLiteral(
      this.target as any,
    );

    if (!objectLiteral) {
      throw new Error('Object literal is missing');
    }

    const fieldMetadataArgsCollection =
      metadataArgsStorage.filterFields(objectLiteral);
    const compositeFieldMetadataArgsCollection =
      fieldMetadataArgsCollection.filter((fieldMetadataArg) =>
        isCompositeFieldMetadataType(fieldMetadataArg.type),
      );

    return compositeFieldMetadataArgsCollection;
  }

  private transformOptions<
    T extends FindManyOptions<Entity> | FindOneOptions<Entity> | undefined,
  >(options: T): T {
    if (!options) {
      return options;
    }

    const transformedOptions = { ...options };

    transformedOptions.where = this.formatData(options.where);

    return transformedOptions;
  }

  private formatData<T>(data: T): T {
    if (!data) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.formatData(item)) as T;
    }
    const compositeFieldMetadataArgsCollection =
      this.getCompositeFieldMetadataArgs();
    const compositeFieldMetadataArgsMap = new Map(
      compositeFieldMetadataArgsCollection.map((fieldMetadataArg) => [
        fieldMetadataArg.name,
        fieldMetadataArg,
      ]),
    );
    const newData: object = {};

    for (const [key, value] of Object.entries(data)) {
      const fieldMetadataArgs = compositeFieldMetadataArgsMap.get(key);

      if (!fieldMetadataArgs) {
        if (isPlainObject(value)) {
          newData[key] = this.formatData(value);
        } else {
          newData[key] = value;
        }
        continue;
      }

      const compositeType = compositeTypeDefintions.get(fieldMetadataArgs.type);

      if (!compositeType) {
        continue;
      }

      for (const compositeProperty of compositeType.properties) {
        const compositeKey = computeCompositeColumnName(
          fieldMetadataArgs.name,
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

  private formatResult<T>(
    data: T,
    target = ObjectLiteralStorage.getObjectLiteral(this.target as any),
  ): T {
    if (!data) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.formatResult(item, target)) as T;
    }

    if (!isPlainObject(data)) {
      return data;
    }

    if (!target) {
      throw new Error('Object literal is missing');
    }

    const fieldMetadataArgsCollection =
      metadataArgsStorage.filterFields(target);
    const relationMetadataArgsCollection =
      metadataArgsStorage.filterRelations(target);
    const compositeFieldMetadataArgsCollection =
      fieldMetadataArgsCollection.filter((fieldMetadataArg) =>
        isCompositeFieldMetadataType(fieldMetadataArg.type),
      );
    const compositeFieldMetadataArgsMap = new Map(
      compositeFieldMetadataArgsCollection.flatMap((fieldMetadataArg) => {
        const compositeType = compositeTypeDefintions.get(
          fieldMetadataArg.type,
        );

        if (!compositeType) return [];

        // Map each composite property to a [key, value] pair
        return compositeType.properties.map((compositeProperty) => [
          computeCompositeColumnName(fieldMetadataArg.name, compositeProperty),
          {
            parentField: fieldMetadataArg.name,
            ...compositeProperty,
          },
        ]);
      }),
    );
    const relationMetadataArgsMap = new Map(
      relationMetadataArgsCollection.map((relationMetadataArgs) => [
        relationMetadataArgs.name,
        relationMetadataArgs,
      ]),
    );
    const newData: object = {};

    for (const [key, value] of Object.entries(data)) {
      const compositePropertyArgs = compositeFieldMetadataArgsMap.get(key);
      const relationMetadataArgs = relationMetadataArgsMap.get(key);

      if (!compositePropertyArgs && !relationMetadataArgs) {
        if (isPlainObject(value)) {
          newData[key] = this.formatResult(value);
        } else {
          newData[key] = value;
        }
        continue;
      }

      if (relationMetadataArgs) {
        newData[key] = this.formatResult(
          value,
          relationMetadataArgs.inverseSideTarget() as any,
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
