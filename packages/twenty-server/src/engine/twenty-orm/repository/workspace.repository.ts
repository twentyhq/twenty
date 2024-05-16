import {
  DeepPartial,
  DeleteResult,
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
  override async find(options?: FindManyOptions<Entity>): Promise<Entity[]> {
    const computedOptions = this.transformOptions(options);
    const result = await super.find(computedOptions);
    const formattedResult = this.formatResult(result);

    return formattedResult;
  }

  override async findBy(
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
  ): Promise<Entity[]> {
    const computedOptions = this.transformOptions({ where });
    const result = await super.findBy(computedOptions.where);
    const formattedResult = this.formatResult(result);

    return formattedResult;
  }

  override async findAndCount(
    options?: FindManyOptions<Entity>,
  ): Promise<[Entity[], number]> {
    const computedOptions = this.transformOptions(options);
    const result = await super.findAndCount(computedOptions);
    const formattedResult = this.formatResult(result);

    return formattedResult;
  }

  override async findAndCountBy(
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
  ): Promise<[Entity[], number]> {
    const computedOptions = this.transformOptions({ where });
    const result = await super.findAndCountBy(computedOptions.where);
    const formattedResult = this.formatResult(result);

    return formattedResult;
  }

  override async findOne(
    options: FindOneOptions<Entity>,
  ): Promise<Entity | null> {
    const computedOptions = this.transformOptions(options);
    const result = await super.findOne(computedOptions);
    const formattedResult = this.formatResult(result);

    return formattedResult;
  }

  override async findOneBy(
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
  ): Promise<Entity | null> {
    const computedOptions = this.transformOptions({ where });
    const result = await super.findOneBy(computedOptions.where);
    const formattedResult = this.formatResult(result);

    return formattedResult;
  }

  override async findOneOrFail(
    options: FindOneOptions<Entity>,
  ): Promise<Entity> {
    const computedOptions = this.transformOptions(options);
    const result = await super.findOneOrFail(computedOptions);
    const formattedResult = this.formatResult(result);

    return formattedResult;
  }

  override async findOneByOrFail(
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
  ): Promise<Entity> {
    const computedOptions = this.transformOptions({ where });
    const result = await super.findOneByOrFail(computedOptions.where);
    const formattedResult = this.formatResult(result);

    return formattedResult;
  }

  /**
   * SAVE METHODS
   */
  override save<T extends DeepPartial<Entity>>(
    entities: T[],
    options: SaveOptions & { reload: false },
  ): Promise<T[]>;

  override save<T extends DeepPartial<Entity>>(
    entities: T[],
    options?: SaveOptions,
  ): Promise<(T & Entity)[]>;

  override save<T extends DeepPartial<Entity>>(
    entity: T,
    options: SaveOptions & { reload: false },
  ): Promise<T>;

  override save<T extends DeepPartial<Entity>>(
    entity: T,
    options?: SaveOptions,
  ): Promise<T & Entity>;

  override async save<T extends DeepPartial<Entity>>(
    entityOrEntities: T | T[],
    options?: SaveOptions,
  ): Promise<T | T[]> {
    const formattedEntityOrEntities = this.formatData(entityOrEntities);
    const result = await super.save(formattedEntityOrEntities as any, options);
    const formattedResult = this.formatResult(result);

    return formattedResult;
  }

  /**
   * REMOVE METHODS
   */
  override remove(
    entities: Entity[],
    options?: RemoveOptions,
  ): Promise<Entity[]>;

  override remove(entity: Entity, options?: RemoveOptions): Promise<Entity>;

  override async remove(
    entityOrEntities: Entity | Entity[],
  ): Promise<Entity | Entity[]> {
    const formattedEntityOrEntities = this.formatData(entityOrEntities);
    const result = await super.remove(formattedEntityOrEntities as any);
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
  ): Promise<DeleteResult> {
    if (typeof criteria === 'object' && 'where' in criteria) {
      criteria = this.transformOptions(criteria);
    }

    return this.delete(criteria);
  }

  override softRemove<T extends DeepPartial<Entity>>(
    entities: T[],
    options: SaveOptions & { reload: false },
  ): Promise<T[]>;

  override softRemove<T extends DeepPartial<Entity>>(
    entities: T[],
    options?: SaveOptions,
  ): Promise<(T & Entity)[]>;

  override softRemove<T extends DeepPartial<Entity>>(
    entity: T,
    options: SaveOptions & { reload: false },
  ): Promise<T>;

  override softRemove<T extends DeepPartial<Entity>>(
    entity: T,
    options?: SaveOptions,
  ): Promise<T & Entity>;

  override async softRemove<T extends DeepPartial<Entity>>(
    entityOrEntities: T | T[],
    options?: SaveOptions,
  ): Promise<T | T[]> {
    const formattedEntityOrEntities = this.formatData(entityOrEntities);
    const result = await super.softRemove(
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
  ): Promise<UpdateResult> {
    if (typeof criteria === 'object' && 'where' in criteria) {
      criteria = this.transformOptions(criteria);
    }

    return this.softDelete(criteria);
  }

  /**
   * RECOVERY METHODS
   */
  override recover<T extends DeepPartial<Entity>>(
    entities: T[],
    options: SaveOptions & { reload: false },
  ): Promise<T[]>;

  override recover<T extends DeepPartial<Entity>>(
    entities: T[],
    options?: SaveOptions,
  ): Promise<(T & Entity)[]>;

  override recover<T extends DeepPartial<Entity>>(
    entity: T,
    options: SaveOptions & { reload: false },
  ): Promise<T>;

  override recover<T extends DeepPartial<Entity>>(
    entity: T,
    options?: SaveOptions,
  ): Promise<T & Entity>;

  override async recover<T extends DeepPartial<Entity>>(
    entityOrEntities: T | T[],
    options?: SaveOptions,
  ): Promise<T | T[]> {
    const formattedEntityOrEntities = this.formatData(entityOrEntities);
    const result = await super.recover(
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
  ): Promise<UpdateResult> {
    if (typeof criteria === 'object' && 'where' in criteria) {
      criteria = this.transformOptions(criteria);
    }

    return this.restore(criteria);
  }

  /**
   * INSERT METHODS
   */
  override async insert(
    entity: QueryDeepPartialEntity<Entity> | QueryDeepPartialEntity<Entity>[],
  ): Promise<InsertResult> {
    const formatedEntity = this.formatData(entity);
    const result = await super.insert(formatedEntity);
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
  ): Promise<UpdateResult> {
    if (typeof criteria === 'object' && 'where' in criteria) {
      criteria = this.transformOptions(criteria);
    }

    return this.update(criteria, partialEntity);
  }

  override upsert(
    entityOrEntities:
      | QueryDeepPartialEntity<Entity>
      | QueryDeepPartialEntity<Entity>[],
    conflictPathsOrOptions: string[] | UpsertOptions<Entity>,
  ): Promise<InsertResult> {
    const formattedEntityOrEntities = this.formatData(entityOrEntities);

    return this.upsert(formattedEntityOrEntities, conflictPathsOrOptions);
  }

  /**
   * EXIST METHODS
   */
  override exist(options?: FindManyOptions<Entity>): Promise<boolean> {
    const computedOptions = this.transformOptions(options);

    return super.exist(computedOptions);
  }

  override exists(options?: FindManyOptions<Entity>): Promise<boolean> {
    const computedOptions = this.transformOptions(options);

    return super.exists(computedOptions);
  }

  override existsBy(
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
  ): Promise<boolean> {
    const computedOptions = this.transformOptions({ where });

    return super.existsBy(computedOptions.where);
  }

  /**
   * COUNT METHODS
   */
  override count(options?: FindManyOptions<Entity>): Promise<number> {
    const computedOptions = this.transformOptions(options);

    return super.count(computedOptions);
  }

  override countBy(
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
  ): Promise<number> {
    const computedOptions = this.transformOptions({ where });

    return super.countBy(computedOptions.where);
  }

  /**
   * MATH METHODS
   */
  override sum(
    columnName: PickKeysByType<Entity, number>,
    where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
  ): Promise<number | null> {
    const computedOptions = this.transformOptions({ where });

    return super.sum(columnName, computedOptions.where);
  }

  override average(
    columnName: PickKeysByType<Entity, number>,
    where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
  ): Promise<number | null> {
    const computedOptions = this.transformOptions({ where });

    return super.average(columnName, computedOptions.where);
  }

  override minimum(
    columnName: PickKeysByType<Entity, number>,
    where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
  ): Promise<number | null> {
    const computedOptions = this.transformOptions({ where });

    return super.minimum(columnName, computedOptions.where);
  }

  override maximum(
    columnName: PickKeysByType<Entity, number>,
    where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
  ): Promise<number | null> {
    const computedOptions = this.transformOptions({ where });

    return super.maximum(columnName, computedOptions.where);
  }

  override increment(
    conditions: FindOptionsWhere<Entity>,
    propertyPath: string,
    value: number | string,
  ): Promise<UpdateResult> {
    const computedConditions = this.transformOptions({ where: conditions });

    return this.increment(computedConditions.where, propertyPath, value);
  }

  override decrement(
    conditions: FindOptionsWhere<Entity>,
    propertyPath: string,
    value: number | string,
  ): Promise<UpdateResult> {
    const computedConditions = this.transformOptions({ where: conditions });

    return this.decrement(computedConditions.where, propertyPath, value);
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
