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
  In,
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
import { EntityPersistExecutor } from 'typeorm/persistence/EntityPersistExecutor';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { PlainObjectToDatabaseEntityTransformer } from 'typeorm/query-builder/transformer/PlainObjectToDatabaseEntityTransformer';
import { UpsertOptions } from 'typeorm/repository/UpsertOptions';
import { InstanceChecker } from 'typeorm/util/InstanceChecker';

import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { QueryDeepPartialEntityWithRelationConnect } from 'src/engine/twenty-orm/entity-manager/types/query-deep-partial-entity-with-relation-connect.type';
import { RelationConnectQueryConfig } from 'src/engine/twenty-orm/entity-manager/types/relation-connect-query-config.type';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import {
  OperationType,
  validateOperationIsPermittedOrThrow,
} from 'src/engine/twenty-orm/repository/permissions.utils';
import { WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { computeRelationConnectQueryConfigs } from 'src/engine/twenty-orm/utils/compute-relation-connect-query-configs.util';
import { createSqlWhereTupleInClause } from 'src/engine/twenty-orm/utils/create-sql-where-tuple-in-clause.utils';
import { formatData } from 'src/engine/twenty-orm/utils/format-data.util';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { getObjectMetadataFromEntityTarget } from 'src/engine/twenty-orm/utils/get-object-metadata-from-entity-target.util';
import { getRecordToConnectFields } from 'src/engine/twenty-orm/utils/get-record-to-connect-fields.util';

type PermissionOptions = {
  shouldBypassPermissionChecks?: boolean;
  objectRecordsPermissions?: ObjectRecordsPermissions;
};

export class WorkspaceEntityManager extends EntityManager {
  private readonly internalContext: WorkspaceInternalContext;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    authContext?: AuthContext,
  ): WorkspaceRepository<Entity> {
    const dataSource = this.connection;

    let objectPermissions = {};

    if (permissionOptions?.roleId) {
      const objectPermissionsByRoleId = dataSource.permissionsPerRoleId;

      if (!isDefined(objectPermissionsByRoleId?.[permissionOptions.roleId])) {
        throw new PermissionsException(
          `No permissions found for role in datasource (missing ${
            !isDefined(objectPermissionsByRoleId)
              ? 'objectPermissionsByRoleId object'
              : `roleId in objectPermissionsByRoleId object (${permissionOptions.roleId})`
          })`,
          PermissionsExceptionCode.NO_PERMISSIONS_FOUND_IN_DATASOURCE,
        );
      } else {
        objectPermissions = objectPermissionsByRoleId[permissionOptions.roleId];
      }
    }

    const newRepository = new WorkspaceRepository<Entity>(
      this.internalContext,
      target,
      this,
      dataSource.featureFlagMap,
      this.queryRunner,
      objectPermissions,
      permissionOptions?.shouldBypassPermissionChecks,
      authContext,
    );

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
      queryBuilder = this.connection.createQueryBuilder(
        entityClassOrQueryRunner as EntityTarget<Entity>,
        alias as string,
        queryRunner as QueryRunner | undefined,
        {
          calledByWorkspaceEntityManager: true,
        },
      );
    } else {
      queryBuilder = this.connection.createQueryBuilder(
        entityClassOrQueryRunner as QueryRunner,
        {
          calledByWorkspaceEntityManager: true,
        },
      );
    }

    return new WorkspaceSelectQueryBuilder(
      queryBuilder,
      options?.objectRecordsPermissions ?? {},
      this.internalContext,
      options?.shouldBypassPermissionChecks ?? false,
    );
  }

  override async insert<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity>,
    entity:
      | QueryDeepPartialEntityWithRelationConnect<Entity>
      | QueryDeepPartialEntityWithRelationConnect<Entity>[],
    permissionOptions?: PermissionOptions,
  ): Promise<InsertResult> {
    const entityArray = Array.isArray(entity) ? entity : [entity];

    const connectedEntities = await this.processRelationConnect<Entity>(
      entityArray,
      target,
      permissionOptions,
    );

    return this.createQueryBuilder(
      undefined,
      undefined,
      undefined,
      permissionOptions,
    )
      .insert()
      .into(target)
      .values(connectedEntities)
      .execute();
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
    const metadata = this.connection.getMetadata(target);
    let options;

    if (Array.isArray(conflictPathsOrOptions)) {
      options = {
        conflictPaths: conflictPathsOrOptions,
      };
    } else {
      options = conflictPathsOrOptions;
    }
    let entities: QueryDeepPartialEntity<Entity>[];

    if (!Array.isArray(entityOrEntities)) {
      entities = [entityOrEntities];
    } else {
      entities = entityOrEntities;
    }
    const conflictColumns = metadata.mapPropertyPathsToColumns(
      Array.isArray(options.conflictPaths)
        ? options.conflictPaths
        : Object.keys(options.conflictPaths),
    );
    const overwriteColumns = metadata.columns.filter(
      (col) =>
        !conflictColumns.includes(col) &&
        entities.some(
          (entity) => typeof col.getEntityValue(entity) !== 'undefined',
        ),
    );

    return this.createQueryBuilder(
      undefined,
      undefined,
      undefined,
      permissionOptions,
    )
      .insert()
      .into(target)
      .values(entities)
      .orUpdate(
        [...conflictColumns, ...overwriteColumns].map(
          (col) => col.databaseName,
        ),
        conflictColumns.map((col) => col.databaseName),
        {
          skipUpdateIfNoValuesChanged: options.skipUpdateIfNoValuesChanged,
          indexPredicate: options.indexPredicate,
          upsertType:
            options.upsertType ||
            this.connection.driver.supportedUpsertTypes[0],
        },
      )
      .execute();
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
      | unknown,
    partialEntity: QueryDeepPartialEntity<Entity>,
    permissionOptions?: PermissionOptions,
  ): Promise<UpdateResult> {
    const metadata = this.connection.getMetadata(target);

    if (
      criteria === undefined ||
      criteria === null ||
      criteria === '' ||
      (Array.isArray(criteria) && criteria.length === 0)
    ) {
      return Promise.reject(
        new TypeORMError(
          `Empty criteria(s) are not allowed for the update method.`,
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
        target,
        metadata.name,
        undefined,
        permissionOptions,
      )
        .update()
        .set(partialEntity)
        .whereInIds(criteria)
        .execute();
    } else {
      return this.createQueryBuilder(
        target,
        metadata.name,
        undefined,
        permissionOptions,
      )
        .update()
        .set(partialEntity)
        .where(criteria)
        .execute();
    }
  }

  override increment<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity>,
    criteria: object,
    propertyPath: string,
    value: number | string,
    permissionOptions?: PermissionOptions,
  ): Promise<UpdateResult> {
    const metadata = this.connection.getMetadata(target);
    const column = metadata.findColumnWithPropertyPath(propertyPath);

    if (!column)
      throw new TypeORMError(
        `Column ${propertyPath} was not found in ${metadata.targetName} entity.`,
      );
    if (isNaN(Number(value)))
      throw new TypeORMError(`Value "${value}" is not a number.`);
    // convert possible embeded path "social.likes" into object { social: { like: () => value } }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const values = propertyPath.split('.').reduceRight<any>(
      (value, key) => ({ [key]: value }),
      () => this.connection.driver.escape(column.databaseName) + ' + ' + value,
    );

    return this.createQueryBuilder(
      target,
      'entity',
      undefined,
      permissionOptions,
    )
      .update(target as QueryDeepPartialEntity<Entity>)
      .set(values)
      .where(criteria)
      .execute();
  }

  validatePermissions<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity> | Entity,
    operationType: OperationType,
    permissionOptions?: {
      shouldBypassPermissionChecks?: boolean;
      objectRecordsPermissions?: ObjectRecordsPermissions;
    },
  ): void {
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
    target: EntityTarget<unknown>,
  ): string {
    return this.connection.getMetadata(target).name;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private extractTargetNameSingularFromEntity(entity: any): string {
    return this.connection.getMetadata(entity.constructor).name;
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
    criteria: unknown,
    permissionOptions?: PermissionOptions,
  ): Promise<DeleteResult> {
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
        undefined,
        permissionOptions,
      )
        .delete()
        .from(targetOrEntity)
        .whereInIds(criteria)
        .execute();
    } else {
      return this.createQueryBuilder(
        undefined,
        undefined,
        undefined,
        permissionOptions,
      )
        .delete()
        .from(targetOrEntity)
        .where(criteria)
        .execute();
    }
  }

  override softDelete<Entity extends ObjectLiteral>(
    targetOrEntity: EntityTarget<Entity>,
    criteria: unknown,
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
          `Empty criteria(s) are not allowed for the softDelete method.`,
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

  override restore<Entity extends ObjectLiteral>(
    targetOrEntity: EntityTarget<Entity>,
    criteria: unknown,
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
          `Empty criteria(s) are not allowed for the restore method.`,
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
      .select('1')
      .limit(1)
      .getRawOne()
      .then((result) => isDefined(result));
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
      .select('1')
      .limit(1)
      .getRawOne()
      .then((result) => isDefined(result));
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

  override async preload<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    entityLike: DeepPartial<Entity>,
    permissionOptions?: PermissionOptions,
  ): Promise<Entity | undefined> {
    const objectMetadataItem = getObjectMetadataFromEntityTarget(
      entityClass,
      this.internalContext,
    );

    const formattedEntityLike = formatData(entityLike, objectMetadataItem);

    const managerWithPermissionOptions = Object.assign(
      Object.create(Object.getPrototypeOf(this)),
      this,
      {
        findByIds: (entityClass: EntityTarget<Entity>, ids: string[]) => {
          return this.findByIds(entityClass, ids, permissionOptions);
        },
      },
    );

    const metadata = this.connection.getMetadata(entityClass);
    const plainObjectToDatabaseEntityTransformer =
      new PlainObjectToDatabaseEntityTransformer(managerWithPermissionOptions);
    const transformedEntity =
      await plainObjectToDatabaseEntityTransformer.transform(
        formattedEntityLike,
        metadata,
      );

    if (transformedEntity)
      return this.merge(
        entityClass,
        transformedEntity,
        formattedEntityLike,
      ) as Entity;

    return undefined;
  }

  override decrement<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity>,
    criteria: object,
    propertyPath: string,
    value: number | string,
    permissionOptions?: PermissionOptions,
  ): Promise<UpdateResult> {
    const metadata = this.connection.getMetadata(target);
    const column = metadata.findColumnWithPropertyPath(propertyPath);

    if (!column)
      throw new TypeORMError(
        `Column ${propertyPath} was not found in ${metadata.targetName} entity.`,
      );
    if (isNaN(Number(value)))
      throw new TypeORMError(`Value "${value}" is not a number.`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const values = propertyPath.split('.').reduceRight<any>(
      (value, key) => ({ [key]: value }),
      () => this.connection.driver.escape(column.databaseName) + ' - ' + value,
    );

    return this.createQueryBuilder(
      target,
      'entity',
      undefined,
      permissionOptions,
    )
      .update(target as QueryDeepPartialEntity<Entity>)
      .set(values)
      .where(criteria)
      .execute();
  }

  override async findByIds<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    ids: string[],
    permissionOptions?: PermissionOptions,
  ): Promise<Entity[]> {
    if (!ids.length) return Promise.resolve([]);
    const metadata = this.connection.getMetadata(entityClass);

    return this.createQueryBuilder(
      entityClass,
      metadata.name,
      undefined,
      permissionOptions,
    )
      .andWhereInIds(ids)
      .getMany();
  }

  /**
   * Functions duplicated from EntityManager but with a queryRunner that will bypass permissions
   * because permissions cannot be passed on to the call to createQueryBuilder() done in SubjectExecutor called by EntityPersistExecutor
   * queryBuilder checks are replaced by validatePermissions()
   */

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

  override async save<
    Entity extends ObjectLiteral,
    T extends DeepPartial<Entity>,
  >(
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

    let target =
      arguments.length > 1 &&
      (typeof targetOrEntity === 'function' ||
        InstanceChecker.isEntitySchema(targetOrEntity) ||
        typeof targetOrEntity === 'string')
        ? targetOrEntity
        : undefined;
    const entity = target ? entityOrMaybeOptions : targetOrEntity;
    const options = target
      ? maybeOptionsOrMaybePermissionOptions
      : entityOrMaybeOptions;

    if (InstanceChecker.isEntitySchema(target)) target = target.options.name;
    if (Array.isArray(entity) && entity.length === 0)
      return Promise.resolve(entity as Entity[]);

    const queryRunnerForEntityPersistExecutor =
      this.connection.createQueryRunnerForEntityPersistExecutor();

    const isEntityArray = Array.isArray(entity);
    const entityTarget =
      target ?? (isEntityArray ? entity[0]?.constructor : entity.constructor);

    const entityArray = isEntityArray ? entity : [entity];
    const entityIds = entityArray.map((e) => (e as { id: string }).id);
    const beforeUpdate = await this.find(
      entityTarget,
      {
        where: { id: In(entityIds) },
      },
      permissionOptions,
    );

    const beforeUpdateMapById = beforeUpdate.reduce(
      (acc, e: ObjectLiteral) => {
        acc[e.id] = e;

        return acc;
      },
      {} as Record<string, ObjectLiteral>,
    );

    const objectMetadataItem = getObjectMetadataFromEntityTarget(
      entityTarget,
      this.internalContext,
    );

    const formattedEntityOrEntities = formatData(
      entityArray,
      objectMetadataItem,
    );

    const result = await new EntityPersistExecutor(
      this.connection,
      queryRunnerForEntityPersistExecutor,
      'save',
      target,
      formattedEntityOrEntities as ObjectLiteral[],
      options as SaveOptions | (SaveOptions & { reload: false }),
    )
      .execute()
      .then(() => formattedEntityOrEntities as Entity[])
      .finally(() => queryRunnerForEntityPersistExecutor.release());

    const resultArray = Array.isArray(result) ? result : [result];

    const formattedResult = formatResult<Entity[]>(
      resultArray,
      objectMetadataItem,
      this.internalContext.objectMetadataMaps,
    );

    for (const entity of formattedResult) {
      const isUpdate = beforeUpdateMapById[entity.id];

      if (isUpdate) {
        await this.internalContext.eventEmitterService.emitMutationEvent({
          action: DatabaseEventAction.UPDATED,
          objectMetadataItem,
          workspaceId: this.internalContext.workspaceId,
          entities: [entity],
          beforeEntities: beforeUpdateMapById[entity.id],
        });
      } else {
        await this.internalContext.eventEmitterService.emitMutationEvent({
          action: DatabaseEventAction.CREATED,
          objectMetadataItem,
          workspaceId: this.internalContext.workspaceId,
          entities: [entity],
        });
      }
    }

    return isEntityArray ? formattedResult : formattedResult[0];
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

  override async remove<Entity extends ObjectLiteral>(
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
      arguments.length > 1 &&
      (typeof targetOrEntity === 'function' ||
        InstanceChecker.isEntitySchema(targetOrEntity) ||
        typeof targetOrEntity === 'string')
        ? targetOrEntity
        : undefined;
    const entity = target ? entityOrMaybeOptions : targetOrEntity;
    const options = target
      ? maybeOptionsOrMaybePermissionOptions
      : entityOrMaybeOptions;

    const isEntityArray = Array.isArray(entity);

    if (isEntityArray && entity.length === 0) return Promise.resolve(entity);

    const queryRunnerForEntityPersistExecutor =
      this.connection.createQueryRunnerForEntityPersistExecutor();

    const entityTarget =
      target ?? (isEntityArray ? entity[0]?.constructor : entity.constructor);

    const objectMetadataItem = getObjectMetadataFromEntityTarget(
      entityTarget,
      this.internalContext,
    );

    const formattedEntity = formatData(entity, objectMetadataItem);

    const result = new EntityPersistExecutor(
      this.connection,
      queryRunnerForEntityPersistExecutor,
      'remove',
      target as string | undefined,
      formattedEntity as ObjectLiteral,
      options as RemoveOptions,
    )
      .execute()
      .then(() => formattedEntity as Entity | Entity[])
      .finally(() => queryRunnerForEntityPersistExecutor.release());

    const formattedResult = formatResult<Entity[]>(
      result,
      objectMetadataItem,
      this.internalContext.objectMetadataMaps,
    );

    await this.internalContext.eventEmitterService.emitMutationEvent({
      action: DatabaseEventAction.DESTROYED,
      objectMetadataItem,
      workspaceId: this.internalContext.workspaceId,
      entities: formattedResult,
    });

    return isEntityArray ? formattedResult : formattedResult[0];
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

    let target =
      arguments.length > 1 &&
      (typeof targetOrEntityOrEntities === 'function' ||
        InstanceChecker.isEntitySchema(targetOrEntityOrEntities) ||
        typeof targetOrEntityOrEntities === 'string')
        ? targetOrEntityOrEntities
        : undefined;
    const entity = target ? entitiesOrMaybeOptions : targetOrEntityOrEntities;
    const options = target
      ? maybeOptionsOrMaybePermissionOptions
      : entitiesOrMaybeOptions;

    if (InstanceChecker.isEntitySchema(target)) target = target.options.name;
    if (Array.isArray(entity) && entity.length === 0)
      return Promise.resolve(entity);

    const queryRunnerForEntityPersistExecutor =
      this.connection.createQueryRunnerForEntityPersistExecutor();

    const isEntityArray = Array.isArray(entity);
    const entityTarget =
      target ?? (isEntityArray ? entity[0]?.constructor : entity.constructor);

    const objectMetadataItem = getObjectMetadataFromEntityTarget(
      entityTarget,
      this.internalContext,
    );

    const formattedEntity = formatData(entity, objectMetadataItem);

    const result = new EntityPersistExecutor(
      this.connection,
      queryRunnerForEntityPersistExecutor,
      'soft-remove',
      target,
      formattedEntity as ObjectLiteral,
      options as SaveOptions,
    )
      .execute()
      .then(() => formattedEntity as Entity)
      .finally(() => queryRunnerForEntityPersistExecutor.release());

    const formattedResult = formatResult<Entity[]>(
      result,
      objectMetadataItem,
      this.internalContext.objectMetadataMaps,
    );

    await this.internalContext.eventEmitterService.emitMutationEvent({
      action: DatabaseEventAction.DELETED,
      objectMetadataItem,
      workspaceId: this.internalContext.workspaceId,
      entities: formattedResult,
    });

    return isEntityArray ? formattedResult : formattedResult[0];
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

  override async recover<
    Entity extends ObjectLiteral,
    T extends DeepPartial<Entity>,
  >(
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
      'restore',
      permissionOptionsFromArgs,
    );

    let target =
      arguments.length > 1 &&
      (typeof targetOrEntityOrEntities === 'function' ||
        InstanceChecker.isEntitySchema(targetOrEntityOrEntities) ||
        typeof targetOrEntityOrEntities === 'string')
        ? targetOrEntityOrEntities
        : undefined;
    const entity = target
      ? entityOrEntitiesOrMaybeOptions
      : targetOrEntityOrEntities;
    const options = target
      ? maybeOptionsOrMaybePermissionOptions
      : entityOrEntitiesOrMaybeOptions;

    if (InstanceChecker.isEntitySchema(target)) target = target.options.name;
    const isEntityArray = Array.isArray(entity);

    if (isEntityArray && entity.length === 0) return Promise.resolve(entity);

    const queryRunnerForEntityPersistExecutor =
      this.connection.createQueryRunnerForEntityPersistExecutor();

    const entityTarget =
      target ?? (isEntityArray ? entity[0]?.constructor : entity.constructor);

    const objectMetadataItem = getObjectMetadataFromEntityTarget(
      entityTarget,
      this.internalContext,
    );

    const formattedEntity = formatData(entity, objectMetadataItem);

    const result = new EntityPersistExecutor(
      this.connection,
      queryRunnerForEntityPersistExecutor,
      'recover',
      target,
      formattedEntity as ObjectLiteral,
      options as SaveOptions,
    )
      .execute()
      .then(() => formattedEntity as Entity)
      .finally(() => queryRunnerForEntityPersistExecutor.release());

    const formattedResult = formatResult<Entity[]>(
      result,
      objectMetadataItem,
      this.internalContext.objectMetadataMaps,
    );

    await this.internalContext.eventEmitterService.emitMutationEvent({
      action: DatabaseEventAction.RESTORED,
      objectMetadataItem,
      workspaceId: this.internalContext.workspaceId,
      entities: formattedResult,
    });

    return isEntityArray ? formattedResult : formattedResult[0];
  }

  // Forbidden methods

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override query<T = any>(_query: string, _parameters?: any[]): Promise<T> {
    throw new PermissionsException(
      'Method not allowed.',
      PermissionsExceptionCode.RAW_SQL_NOT_ALLOWED,
    );
  }

  private async processRelationConnect<Entity extends ObjectLiteral>(
    entities: QueryDeepPartialEntityWithRelationConnect<Entity>[],
    target: EntityTarget<Entity>,
    permissionOptions?: PermissionOptions,
  ): Promise<QueryDeepPartialEntity<Entity>[]> {
    const objectMetadata = getObjectMetadataFromEntityTarget(
      target,
      this.internalContext,
    );

    const objectMetadataMap = this.internalContext.objectMetadataMaps;

    const relationConnectQueryConfigs = computeRelationConnectQueryConfigs(
      entities,
      objectMetadata,
      objectMetadataMap,
    );

    if (!isDefined(relationConnectQueryConfigs)) return entities;

    const recordsToConnectWithConfig = await this.executeConnectQueries(
      relationConnectQueryConfigs,
      permissionOptions,
    );

    const updatedEntities = this.updateEntitiesWithRecordToConnectId<Entity>(
      entities,
      recordsToConnectWithConfig,
    );

    return updatedEntities;
  }

  private async executeConnectQueries(
    relationConnectQueryConfigs: Record<string, RelationConnectQueryConfig>,
    permissionOptions?: PermissionOptions,
  ): Promise<[RelationConnectQueryConfig, Record<string, unknown>[]][]> {
    const AllRecordsToConnectWithConfig: [
      RelationConnectQueryConfig,
      Record<string, unknown>[],
    ][] = [];

    for (const connectQueryConfig of Object.values(
      relationConnectQueryConfigs,
    )) {
      const { clause, parameters } = createSqlWhereTupleInClause(
        connectQueryConfig.recordToConnectConditions,
        connectQueryConfig.targetObjectName,
      );

      const recordsToConnect = await this.createQueryBuilder(
        connectQueryConfig.targetObjectName,
        connectQueryConfig.targetObjectName,
        undefined,
        permissionOptions,
      )
        .select(getRecordToConnectFields(connectQueryConfig))
        .where(clause, parameters)
        .getRawMany();

      AllRecordsToConnectWithConfig.push([
        connectQueryConfig,
        recordsToConnect,
      ]);
    }

    return AllRecordsToConnectWithConfig;
  }

  private updateEntitiesWithRecordToConnectId<Entity extends ObjectLiteral>(
    entities: QueryDeepPartialEntityWithRelationConnect<Entity>[],
    recordsToConnectWithConfig: [
      RelationConnectQueryConfig,
      Record<string, unknown>[],
    ][],
  ): QueryDeepPartialEntity<Entity>[] {
    return entities.map((entity, index) => {
      for (const [
        connectQueryConfig,
        recordsToConnect,
      ] of recordsToConnectWithConfig) {
        if (
          isDefined(
            connectQueryConfig.recordToConnectConditionByEntityIndex[index],
          )
        ) {
          const recordToConnect = recordsToConnect.filter((record) =>
            connectQueryConfig.recordToConnectConditionByEntityIndex[
              index
            ].every(([field, value]) => record[field] === value),
          );

          if (recordToConnect.length !== 1) {
            const recordToConnectTotal = recordToConnect.length;
            const connectFieldName = connectQueryConfig.connectFieldName;

            throw new TwentyORMException(
              `Expected 1 record to connect to ${connectFieldName}, but found ${recordToConnectTotal}.`,
              TwentyORMExceptionCode.CONNECT_RECORD_NOT_FOUND,
            );
          }

          entity = {
            ...entity,
            [connectQueryConfig.relationFieldName]: recordToConnect[0]['id'],
            [connectQueryConfig.connectFieldName]: null,
          };
        }
      }

      return entity;
    });
  }
}
