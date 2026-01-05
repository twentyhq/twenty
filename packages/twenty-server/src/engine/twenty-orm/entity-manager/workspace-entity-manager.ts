import isEmpty from 'lodash.isempty';
import {
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type DeleteResult,
  EntityManager,
  type EntityTarget,
  type FindManyOptions,
  type FindOneOptions,
  type FindOptionsWhere,
  In,
  type InsertResult,
  type ObjectId,
  type ObjectLiteral,
  type QueryRunner,
  type RemoveOptions,
  type Repository,
  type SaveOptions,
  type SelectQueryBuilder,
  TypeORMError,
  type UpdateResult,
} from 'typeorm';
import { type DeepPartial } from 'typeorm/common/DeepPartial';
import { type PickKeysByType } from 'typeorm/common/PickKeysByType';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { FindOptionsUtils } from 'typeorm/find-options/FindOptionsUtils';
import { EntityPersistExecutor } from 'typeorm/persistence/EntityPersistExecutor';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { PlainObjectToDatabaseEntityTransformer } from 'typeorm/query-builder/transformer/PlainObjectToDatabaseEntityTransformer';
import { type UpsertOptions } from 'typeorm/repository/UpsertOptions';
import { InstanceChecker } from 'typeorm/util/InstanceChecker';

import { type WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';
import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type DeepPartialWithNestedRelationFields } from 'src/engine/twenty-orm/entity-manager/types/deep-partial-entity-with-nested-relation-fields.type';
import { type QueryDeepPartialEntityWithNestedRelationFields } from 'src/engine/twenty-orm/entity-manager/types/query-deep-partial-entity-with-nested-relation-fields.type';
import { getEntityTarget } from 'src/engine/twenty-orm/entity-manager/utils/get-entity-target';
import { computeTwentyORMException } from 'src/engine/twenty-orm/error-handling/compute-twenty-orm-exception';
import { type GlobalWorkspaceDataSource } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource';
import { RelationNestedQueries } from 'src/engine/twenty-orm/relation-nested-queries/relation-nested-queries';
import {
  type OperationType,
  validateOperationIsPermittedOrThrow,
} from 'src/engine/twenty-orm/repository/permissions.utils';
import { WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { computePermissionIntersection } from 'src/engine/twenty-orm/utils/compute-permission-intersection.util';
import { formatData } from 'src/engine/twenty-orm/utils/format-data.util';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { formatTwentyOrmEventToDatabaseBatchEvent } from 'src/engine/twenty-orm/utils/format-twenty-orm-event-to-database-batch-event.util';
import { getObjectMetadataFromEntityTarget } from 'src/engine/twenty-orm/utils/get-object-metadata-from-entity-target.util';
import { type WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

type PermissionOptions = {
  shouldBypassPermissionChecks?: boolean;
  objectRecordsPermissions?: ObjectsPermissions;
};

export class WorkspaceEntityManager extends EntityManager {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly repositories: Map<string, Repository<any>>;
  declare connection: GlobalWorkspaceDataSource;

  constructor(
    connection: GlobalWorkspaceDataSource,
    queryRunner?: QueryRunner,
  ) {
    super(connection, queryRunner);
    this.repositories = new Map();
  }

  private get eventEmitterService(): WorkspaceEventEmitter {
    return this.connection.eventEmitterService;
  }

  get authContext(): WorkspaceAuthContext {
    const context = getWorkspaceContext();

    return context.authContext;
  }

  get internalContext(): WorkspaceInternalContext {
    const context = getWorkspaceContext();

    return {
      workspaceId: context.authContext.workspace.id,
      flatObjectMetadataMaps: context.flatObjectMetadataMaps,
      flatFieldMetadataMaps: context.flatFieldMetadataMaps,
      flatIndexMaps: context.flatIndexMaps,
      flatRowLevelPermissionPredicateMaps:
        context.flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps:
        context.flatRowLevelPermissionPredicateGroupMaps,
      objectIdByNameSingular: context.objectIdByNameSingular,
      featureFlagsMap: context.featureFlagsMap,
      userWorkspaceRoleMap: context.userWorkspaceRoleMap,
      eventEmitterService: this.eventEmitterService,
    };
  }

  getFeatureFlagMap(): FeatureFlagMap {
    return this.connection.featureFlagMap;
  }

  private getPermissionsForRole(
    roleId: string,
    permissionsPerRoleId: ObjectsPermissionsByRoleId,
  ): ObjectsPermissions {
    if (!isDefined(permissionsPerRoleId?.[roleId])) {
      throw new PermissionsException(
        `No permissions found for role in datasource (roleId: ${roleId})`,
        PermissionsExceptionCode.NO_PERMISSIONS_FOUND_IN_DATASOURCE,
      );
    }

    return permissionsPerRoleId[roleId];
  }

  override getRepository<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity>,
    rolePermissionConfig?: RolePermissionConfig,
    authContext?: AuthContext,
  ): WorkspaceRepository<Entity> {
    const dataSource = this.connection;

    let objectPermissions = {};
    let shouldBypassPermissionChecks = false;
    const objectPermissionsByRoleId = dataSource.permissionsPerRoleId;

    if (
      rolePermissionConfig &&
      'shouldBypassPermissionChecks' in rolePermissionConfig
    ) {
      shouldBypassPermissionChecks =
        rolePermissionConfig.shouldBypassPermissionChecks;
    }

    if (rolePermissionConfig && 'unionOf' in rolePermissionConfig) {
      if (rolePermissionConfig.unionOf.length === 1) {
        objectPermissions = this.getPermissionsForRole(
          rolePermissionConfig.unionOf[0],
          objectPermissionsByRoleId,
        );
      } else {
        // TODO: Implement union logic for combining permissions across multiple roles
        throw new Error(
          'Union permission logic for multiple roles not yet implemented',
        );
      }
    }

    if (rolePermissionConfig && 'intersectionOf' in rolePermissionConfig) {
      const allRolePermissions = rolePermissionConfig.intersectionOf.map(
        (roleId: string) =>
          this.getPermissionsForRole(roleId, objectPermissionsByRoleId),
      );

      objectPermissions = computePermissionIntersection(allRolePermissions);
    }

    const newRepository = new WorkspaceRepository<Entity>(
      target,
      this,
      dataSource.featureFlagMap,
      this.queryRunner,
      objectPermissions,
      shouldBypassPermissionChecks,
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
      objectRecordsPermissions?: ObjectsPermissions;
    } = {
      shouldBypassPermissionChecks: false,
      objectRecordsPermissions: {},
    },
  ): WorkspaceSelectQueryBuilder<Entity> {
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
      this.authContext,
      this.getFeatureFlagMap(),
    );
  }

  override async insert<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity>,
    entity:
      | QueryDeepPartialEntityWithNestedRelationFields<Entity>
      | QueryDeepPartialEntityWithNestedRelationFields<Entity>[],
    selectedColumns: string[] | '*' = '*',
    permissionOptions?: PermissionOptions,
    authContext?: AuthContext,
  ): Promise<InsertResult> {
    const metadata = this.connection.getMetadata(target);

    return this.createQueryBuilder(
      target,
      metadata.name,
      undefined,
      permissionOptions,
    )
      .insert()
      .setAuthContext(authContext ?? {})
      .values(entity)
      .returning(selectedColumns)
      .execute();
  }

  override upsert<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity>,
    entityOrEntities:
      | QueryDeepPartialEntityWithNestedRelationFields<Entity>
      | QueryDeepPartialEntityWithNestedRelationFields<Entity>[],
    conflictPathsOrOptions: string[] | UpsertOptions<Entity>,
    permissionOptions?: {
      shouldBypassPermissionChecks?: boolean;
      objectRecordsPermissions?: ObjectsPermissions;
    },
    selectedColumns: string[] | '*' = '*',
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
    let entities: QueryDeepPartialEntityWithNestedRelationFields<Entity>[];

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

    const overwrites = [...conflictColumns, ...overwriteColumns].map(
      (col) => col.databaseName,
    );

    const conflictTargets = conflictColumns.map((col) => col.databaseName);

    const upsertOptions = {
      skipUpdateIfNoValuesChanged: options.skipUpdateIfNoValuesChanged,
      indexPredicate: options.indexPredicate,
      upsertType:
        options.upsertType || this.connection.driver.supportedUpsertTypes[0],
    };

    const queryBuilder = this.createQueryBuilder(
      undefined,
      undefined,
      undefined,
      permissionOptions,
    )
      .insert()
      .into(target)
      .values(entities)
      .orUpdate(overwrites, conflictTargets, upsertOptions)
      .returning(selectedColumns);

    return queryBuilder.execute();
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
    selectedColumns: string[] | '*' = '*',
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
        .returning(selectedColumns)
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
        .returning(selectedColumns)
        .execute();
    }
  }

  public updateMany<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity>,
    inputs: {
      criteria: string;
      partialEntity: QueryDeepPartialEntity<Entity>;
    }[],
    permissionOptions?: PermissionOptions,
    selectedColumns: string[] | '*' = '*',
  ): Promise<UpdateResult> {
    const metadata = this.connection.getMetadata(target);

    return this.createQueryBuilder(
      target,
      metadata.name,
      undefined,
      permissionOptions,
    )
      .update()
      .setManyInputs(inputs)
      .returning(selectedColumns ?? [])
      .execute();
  }

  override increment<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity>,
    criteria: object,
    propertyPath: string,
    value: number | string,
    permissionOptions?: PermissionOptions,
    selectedColumns: string[] | '*' = '*',
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

    return this.update(
      target,
      criteria,
      values,
      permissionOptions,
      selectedColumns,
    );
  }

  validatePermissions<Entity extends ObjectLiteral>({
    target,
    operationType,
    permissionOptions,
    selectedColumns,
    updatedColumns = [],
  }: {
    target: EntityTarget<Entity> | Entity;
    operationType: OperationType;
    permissionOptions?: {
      shouldBypassPermissionChecks?: boolean;
      objectRecordsPermissions?: ObjectsPermissions;
    };
    selectedColumns: string[];
    updatedColumns?: string[];
  }): void {
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
      objectsPermissions: permissionOptions?.objectRecordsPermissions ?? {},
      flatObjectMetadataMaps: this.internalContext.flatObjectMetadataMaps,
      flatFieldMetadataMaps: this.internalContext.flatFieldMetadataMaps,
      objectIdByNameSingular: this.internalContext.objectIdByNameSingular,
      selectedColumns,
      allFieldsSelected: false,
      updatedColumns,
    });
  }

  private extractTargetNameSingularFromEntityTarget(
    target: EntityTarget<ObjectLiteral>,
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
    selectedColumns: string[] | '*' = '*',
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
        .returning(selectedColumns)
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
        .returning(selectedColumns)
        .execute();
    }
  }

  override softDelete<Entity extends ObjectLiteral>(
    targetOrEntity: EntityTarget<Entity>,
    criteria: unknown,
    permissionOptions?: PermissionOptions,
    selectedColumns: string[] | '*' = '*',
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
        .returning(selectedColumns)
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
        .returning(selectedColumns)
        .execute();
    }
  }

  override restore<Entity extends ObjectLiteral>(
    targetOrEntity: EntityTarget<Entity>,
    criteria: unknown,
    permissionOptions?: PermissionOptions,
    selectedColumns: string[] | '*' = '*',
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
        .returning(selectedColumns)
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
        .returning(selectedColumns)
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
      .select('id')
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
      .select('id')
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

  async callAggregateFunCustom<Entity extends ObjectLiteral>(
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
    this.validatePermissions({
      target: entityClass,
      operationType: 'delete',
      permissionOptions,
      selectedColumns: [], // TODO
    });

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

    const formattedEntityLike = formatData(
      entityLike,
      objectMetadataItem,
      this.internalContext.flatFieldMetadataMaps,
    );

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
    selectedColumns: string[] | '*' = '*',
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

    return this.update(
      target,
      criteria,
      values,
      permissionOptions,
      selectedColumns,
    );
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

  override save<Entity, T extends DeepPartialWithNestedRelationFields<Entity>>(
    targetOrEntity: EntityTarget<Entity>,
    entities: T[],
    options: SaveOptions & {
      reload: false;
    },
    permissionOptions?: PermissionOptions,
  ): Promise<T[]>;

  override save<Entity, T extends DeepPartialWithNestedRelationFields<Entity>>(
    targetOrEntity: EntityTarget<Entity>,
    entities: T[],
    options?: SaveOptions,
    permissionOptions?: PermissionOptions,
  ): Promise<(T & Entity)[]>;

  override save<Entity, T extends DeepPartialWithNestedRelationFields<Entity>>(
    targetOrEntity: EntityTarget<Entity>,
    entity: T,
    options: SaveOptions & {
      reload: false;
    },
    permissionOptions?: PermissionOptions,
  ): Promise<T>;

  override save<Entity, T extends DeepPartialWithNestedRelationFields<Entity>>(
    targetOrEntity: EntityTarget<Entity>,
    entity: T,
    options?: SaveOptions,
    permissionOptions?: PermissionOptions,
  ): Promise<T>;

  override async save<
    Entity extends ObjectLiteral,
    T extends DeepPartialWithNestedRelationFields<Entity>,
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
    try {
      const permissionOptionsFromArgs =
        maybeOptionsOrMaybePermissionOptions &&
        ('shouldBypassPermissionChecks' in
          maybeOptionsOrMaybePermissionOptions ||
          'objectRecordsPermissions' in maybeOptionsOrMaybePermissionOptions)
          ? maybeOptionsOrMaybePermissionOptions
          : permissionOptions;

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

      const relationNestedQueries = new RelationNestedQueries(
        this.internalContext,
      );

      const relationNestedConfig =
        relationNestedQueries.prepareNestedRelationQueries(
          entityArray,
          entityTarget,
        );

      const entityWithConnectedRelations = isDefined(relationNestedConfig)
        ? await relationNestedQueries.processRelationNestedQueries({
            entities: entityArray,
            relationNestedConfig,
            queryBuilder: this.createQueryBuilder(
              undefined,
              undefined,
              undefined,
              permissionOptions,
            ),
          })
        : entityArray;

      const entityIds = entityArray
        .map((entity) => (entity as { id: string }).id)
        .filter(isDefined);
      const beforeUpdate = await this.find(
        entityTarget,
        {
          where: { id: In(entityIds) },
        },
        { shouldBypassPermissionChecks: true }, // Bypass as this is for event emission
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
        entityWithConnectedRelations,
        objectMetadataItem,
        this.internalContext.flatFieldMetadataMaps,
      );

      const updatedColumns = formattedEntityOrEntities
        .map((e) => Object.keys(e))
        .flat();

      this.validatePermissions({
        target: targetOrEntity,
        operationType: 'update',
        permissionOptions: permissionOptionsFromArgs,
        selectedColumns: [],
        updatedColumns,
      });

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

      let formattedResult = formatResult<Entity[]>(
        resultArray,
        objectMetadataItem,
        this.internalContext.flatObjectMetadataMaps,
        this.internalContext.flatFieldMetadataMaps,
      );

      const updatedEntities = formattedResult.filter(
        (entity) => beforeUpdateMapById[entity.id],
      );
      const createdEntities = formattedResult.filter(
        (entity) => !beforeUpdateMapById[entity.id],
      );

      this.internalContext.eventEmitterService.emitDatabaseBatchEvent(
        formatTwentyOrmEventToDatabaseBatchEvent({
          action: DatabaseEventAction.UPDATED,
          objectMetadataItem,
          flatFieldMetadataMaps: this.internalContext.flatFieldMetadataMaps,
          workspaceId: this.internalContext.workspaceId,
          entities: updatedEntities,
          beforeEntities: updatedEntities.map(
            (entity) => beforeUpdateMapById[entity.id],
          ),
        }),
      );

      this.internalContext.eventEmitterService.emitDatabaseBatchEvent(
        formatTwentyOrmEventToDatabaseBatchEvent({
          action: DatabaseEventAction.CREATED,
          objectMetadataItem,
          flatFieldMetadataMaps: this.internalContext.flatFieldMetadataMaps,
          workspaceId: this.internalContext.workspaceId,
          entities: createdEntities,
        }),
      );

      const permissionCheckApplies =
        permissionOptionsFromArgs?.shouldBypassPermissionChecks !== true &&
        objectMetadataItem.isSystem !== true;

      if (permissionCheckApplies) {
        formattedResult = this.getFormattedResultWithoutNonReadableFields({
          formattedResult,
          objectMetadataItem,
          permissionOptionsFromArgs,
        });
      }

      return isEntityArray ? formattedResult : formattedResult[0];
    } catch (error) {
      const objectMetadataItem = getObjectMetadataFromEntityTarget(
        getEntityTarget(targetOrEntity, entityOrMaybeOptions),
        this.internalContext,
      );

      throw await computeTwentyORMException(
        error,
        objectMetadataItem,
        this,
        this.internalContext,
      );
    }
  }

  private getFormattedResultWithoutNonReadableFields<
    Entity extends ObjectLiteral,
  >({
    formattedResult,
    objectMetadataItem,
    permissionOptionsFromArgs,
  }: {
    formattedResult: Entity[];
    objectMetadataItem: FlatObjectMetadata;
    permissionOptionsFromArgs: PermissionOptions | undefined;
  }): Entity[] {
    if (permissionOptionsFromArgs?.shouldBypassPermissionChecks === true) {
      return formattedResult;
    }

    const restrictedFields =
      permissionOptionsFromArgs?.objectRecordsPermissions?.[
        objectMetadataItem.id
      ].restrictedFields;

    if (!restrictedFields) {
      throw new InternalServerError('Restricted fields not found');
    }

    if (isEmpty(restrictedFields)) {
      return formattedResult;
    }

    const restrictedFieldNames = new Set(
      Object.entries(restrictedFields)
        .filter(([_, fieldPermissions]) => fieldPermissions.canRead === false)
        .map(([fieldMetadataId]) => {
          const fieldMetadata =
            this.internalContext.flatFieldMetadataMaps.byId[fieldMetadataId];

          if (!isDefined(fieldMetadata)) {
            throw new InternalServerError(
              `Field metadata not found for field ${fieldMetadataId}`,
            );
          }

          return fieldMetadata.name;
        }),
    );

    const filteredResult = formattedResult.map((individualFormattedResult) => {
      return Object.fromEntries(
        Object.entries(individualFormattedResult).filter(
          ([key]) => !restrictedFieldNames.has(key),
        ),
      );
    });

    return filteredResult as Entity[];
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

    this.validatePermissions({
      target: targetOrEntity,
      operationType: 'delete',
      permissionOptions: permissionOptionsFromArgs,
      selectedColumns: [], // TODO
    });

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

    const formattedEntity = formatData(
      entity,
      objectMetadataItem,
      this.internalContext.flatFieldMetadataMaps,
    );

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
      this.internalContext.flatObjectMetadataMaps,
      this.internalContext.flatFieldMetadataMaps,
    );

    this.internalContext.eventEmitterService.emitDatabaseBatchEvent(
      formatTwentyOrmEventToDatabaseBatchEvent({
        action: DatabaseEventAction.DESTROYED,
        objectMetadataItem,
        flatFieldMetadataMaps: this.internalContext.flatFieldMetadataMaps,
        workspaceId: this.internalContext.workspaceId,
        entities: formattedResult,
      }),
    );

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

    this.validatePermissions({
      target: targetOrEntityOrEntities,
      operationType: 'soft-delete',
      permissionOptions: permissionOptionsFromArgs,
      selectedColumns: [], // TODO
    });

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

    const formattedEntity = formatData(
      entity,
      objectMetadataItem,
      this.internalContext.flatFieldMetadataMaps,
    );

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
      this.internalContext.flatObjectMetadataMaps,
      this.internalContext.flatFieldMetadataMaps,
    );

    this.internalContext.eventEmitterService.emitDatabaseBatchEvent(
      formatTwentyOrmEventToDatabaseBatchEvent({
        action: DatabaseEventAction.DELETED,
        objectMetadataItem,
        flatFieldMetadataMaps: this.internalContext.flatFieldMetadataMaps,
        workspaceId: this.internalContext.workspaceId,
        entities: formattedResult,
      }),
    );

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

    this.validatePermissions({
      target: targetOrEntityOrEntities,
      operationType: 'restore',
      permissionOptions: permissionOptionsFromArgs,
      selectedColumns: [], // TODO
    });

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

    const formattedEntity = formatData(
      entity,
      objectMetadataItem,
      this.internalContext.flatFieldMetadataMaps,
    );

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
      this.internalContext.flatObjectMetadataMaps,
      this.internalContext.flatFieldMetadataMaps,
    );

    this.internalContext.eventEmitterService.emitDatabaseBatchEvent(
      formatTwentyOrmEventToDatabaseBatchEvent({
        action: DatabaseEventAction.RESTORED,
        objectMetadataItem,
        flatFieldMetadataMaps: this.internalContext.flatFieldMetadataMaps,
        workspaceId: this.internalContext.workspaceId,
        entities: formattedResult,
      }),
    );

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
}
