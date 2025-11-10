import { type ObjectsPermissions } from 'twenty-shared/types';
import {
  type EntityTarget,
  type FindManyOptions,
  type ObjectLiteral,
  SelectQueryBuilder,
} from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { type QueryBuilderCteOptions } from 'typeorm/query-builder/QueryBuilderCte';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { DriverUtils } from 'typeorm/driver/DriverUtils';

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { computeTwentyORMException } from 'src/engine/twenty-orm/error-handling/compute-twenty-orm-exception';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { validateQueryIsPermittedOrThrow } from 'src/engine/twenty-orm/repository/permissions.utils';
import { WorkspaceDeleteQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-delete-query-builder';
import { WorkspaceInsertQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-insert-query-builder';
import { WorkspaceSoftDeleteQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-soft-delete-query-builder';
import { WorkspaceUpdateQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-update-query-builder';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { getObjectMetadataFromEntityTarget } from 'src/engine/twenty-orm/utils/get-object-metadata-from-entity-target.util';
import { EXTERNAL_STORAGE_ALIAS } from 'src/engine/twenty-orm/utils/external-storage-alias.constant';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';
import { getColumnNameToFieldMetadataIdMap } from 'src/engine/twenty-orm/utils/get-column-name-to-field-metadata-id.util';

export class WorkspaceSelectQueryBuilder<
  T extends ObjectLiteral,
> extends SelectQueryBuilder<T> {
  objectRecordsPermissions: ObjectsPermissions;
  shouldBypassPermissionChecks: boolean;
  internalContext: WorkspaceInternalContext;
  authContext?: AuthContext;
  featureFlagMap?: FeatureFlagMap;
  private externalStorageState: {
    promise: Promise<void> | null;
    isFullfilled: boolean;
  } = { promise: null, isFullfilled: false };

  constructor(
    queryBuilder: SelectQueryBuilder<T>,
    objectRecordsPermissions: ObjectsPermissions,
    internalContext: WorkspaceInternalContext,
    shouldBypassPermissionChecks: boolean,
    authContext?: AuthContext,
    featureFlagMap?: FeatureFlagMap,
  ) {
    super(queryBuilder);
    this.objectRecordsPermissions = objectRecordsPermissions;
    this.internalContext = internalContext;
    this.shouldBypassPermissionChecks = shouldBypassPermissionChecks;
    this.authContext = authContext;
    this.featureFlagMap = featureFlagMap;
  }

  prepareExternalStorage(alias: string): void {
    if (!isDefined(this.externalStorageState.promise)) {
      this.externalStorageState.isFullfilled = false;
      this.externalStorageState.promise = this.appendExternalFields(alias);
    }
  }

  private async ensureExternalStorageReady(): Promise<void> {
    if (isDefined(this.externalStorageState.promise)) {
      await this.externalStorageState.promise;
      this.externalStorageState.isFullfilled = true;
    }
  }

  async appendExternalFields(alias: string) {
    const objectMetadataMapItem = getObjectMetadataMapItemByNameSingular(
      this.internalContext.objectMetadataMaps,
      alias,
    );

    assertIsDefinedOrThrow(objectMetadataMapItem);

    await Promise.all(
      Object.values(objectMetadataMapItem.fieldsById).map(async (field) => {
        if (
          isDefined(field.storage) &&
          field.storage !== 'postgres' &&
          !isDefined(this.internalContext.externalFieldDrivers[field.storage])
        ) {
          throw new TwentyORMException(
            `External storage driver "${field.storage}" not found`,
            TwentyORMExceptionCode.EXTERNAL_STORAGE_DRIVER_MISSING,
          );
        }
        // todo: move this logic to the driver scoped function
        if (field.storage === 'redis' && isDefined(this.authContext?.user)) {
          const parts =
            await this.internalContext.externalFieldDrivers.redis.collectData(
              {
                userId: this.authContext?.user.id,
                workspaceId: this.internalContext.workspaceId,
                objectMetadataId: field.objectMetadataId,
              },
              field.name,
              this.alias,
            );

          this.addCommonTableExpression(parts.cteSql, parts.cteName, {
            columnNames: parts.cteColumns,
          });
          this.leftJoin(parts.cteName, `${field.name}Records`, parts.joinOn);
        }
      }),
    );
  }

  getFindOptions() {
    return this.findOptions;
  }

  addCommonTableExpression(
    query: string,
    alias: string,
    options?: QueryBuilderCteOptions,
  ): this {
    try {
      super.addCommonTableExpression(query, alias, options);

      return this;
    } catch (error) {
      throw computeTwentyORMException(error);
    }
  }

  override createOrderByExpression() {
    const orderBys = this.expressionMap.allOrderBys;

    if (Object.keys(orderBys).length === 0) return '';

    const orderBysSql =
      ' ORDER BY ' +
      Object.keys(orderBys)
        .map((columnName) => {
          const orderValue =
            typeof orderBys[columnName] === 'string'
              ? orderBys[columnName]
              : orderBys[columnName].order + ' ' + orderBys[columnName].nulls;

          const selection = this.expressionMap.selects.find(
            (s) => s.selection === columnName || s.aliasName === columnName,
          );

          if (columnName.startsWith(EXTERNAL_STORAGE_ALIAS)) {
            return this.escape(columnName) + ' ' + orderValue;
          }

          if (
            selection &&
            !selection.aliasName &&
            columnName.indexOf('.') !== -1
          ) {
            const criteriaParts = columnName.split('.');
            const aliasName = criteriaParts[0];
            const propertyPath = criteriaParts.slice(1).join('.');
            const alias = this.expressionMap.aliases.find(
              (alias) => alias.name === aliasName,
            );

            if (alias) {
              const column =
                alias.metadata.findColumnWithPropertyPath(propertyPath);

              if (column) {
                const orderAlias = DriverUtils.buildAlias(
                  this.connection.driver,
                  undefined,
                  aliasName,
                  column.databaseName,
                );

                return this.escape(orderAlias) + ' ' + orderValue;
              }
            }
          }

          return columnName + ' ' + orderValue;
        })
        .join(', ');

    return orderBysSql;
  }

  override clone(): this {
    const clonedQueryBuilder = super.clone();

    const qb = new WorkspaceSelectQueryBuilder(
      clonedQueryBuilder,
      this.objectRecordsPermissions,
      this.internalContext,
      this.shouldBypassPermissionChecks,
      this.authContext,
      this.featureFlagMap,
    ) as this;

    if (
      isDefined(this.externalStorageState.promise) === true &&
      this.externalStorageState.isFullfilled === false
    ) {
      qb.prepareExternalStorage(this.alias);
    } else {
      qb.externalStorageState = this.externalStorageState;
    }

    return qb;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async execute(): Promise<any> {
    try {
      await this.ensureExternalStorageReady();
      this.validatePermissions();

      const mainAliasTarget = this.getMainAliasTarget();

      const objectMetadata = getObjectMetadataFromEntityTarget(
        mainAliasTarget,
        this.internalContext,
      );

      const result = await super.execute();

      const formattedResult = formatResult<T[]>(
        result,
        objectMetadata,
        this.internalContext.objectMetadataMaps,
      );

      return {
        raw: result,
        generatedMaps: formattedResult,
        identifiers: result.identifiers,
      };
    } catch (error) {
      throw computeTwentyORMException(error);
    }
  }

  override async getMany(): Promise<T[]> {
    try {
      await this.ensureExternalStorageReady();
      this.validatePermissions();

      const mainAliasTarget = this.getMainAliasTarget();

      const objectMetadata = getObjectMetadataFromEntityTarget(
        mainAliasTarget,
        this.internalContext,
      );

      const { entities, raw } = await super.getRawAndEntities();

      const byId = new Map<string, Record<string, unknown>>();

      for (const e of entities) {
        byId.set(e.id, e);
      }

      for (const rawRow of raw) {
        const pkName = `${this.alias}_id`;
        const pk = rawRow[pkName];

        if (!pk) continue;

        const entity = byId.get(pk);

        for (const [key, value] of Object.entries(rawRow)) {
          if (key === pkName) continue;
          if (isDefined(entity) && key.startsWith(EXTERNAL_STORAGE_ALIAS)) {
            entity[
              key.replace(
                `${EXTERNAL_STORAGE_ALIAS}_${mainAliasTarget}_`,
                '',
              ) as keyof typeof entity
            ] = value;
          }
        }
      }

      const formattedResult = formatResult<T[]>(
        entities,
        objectMetadata,
        this.internalContext.objectMetadataMaps,
      );

      return formattedResult;
    } catch (error) {
      throw computeTwentyORMException(error);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async getRawOne<U = any>(): Promise<U | undefined> {
    try {
      await this.ensureExternalStorageReady();
      this.validatePermissions();

      return await super.getRawOne();
    } catch (error) {
      throw computeTwentyORMException(error);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async getRawMany<U = any>(): Promise<U[]> {
    try {
      await this.ensureExternalStorageReady();
      this.validatePermissions();

      return await super.getRawMany();
    } catch (error) {
      throw computeTwentyORMException(error);
    }
  }

  override async getOne(): Promise<T | null> {
    try {
      await this.ensureExternalStorageReady();
      this.validatePermissions();

      const mainAliasTarget = this.getMainAliasTarget();

      const objectMetadata = getObjectMetadataFromEntityTarget(
        mainAliasTarget,
        this.internalContext,
      );

      this.take(1);

      const result = await super.getOne();

      const formattedResult = formatResult<T>(
        result,
        objectMetadata,
        this.internalContext.objectMetadataMaps,
      );

      return formattedResult;
    } catch (error) {
      throw computeTwentyORMException(error);
    }
  }

  override async getOneOrFail(): Promise<T> {
    try {
      await this.ensureExternalStorageReady();
      this.validatePermissions();

      const mainAliasTarget = this.getMainAliasTarget();

      const objectMetadata = getObjectMetadataFromEntityTarget(
        mainAliasTarget,
        this.internalContext,
      );

      const result = await super.getOneOrFail();

      const formattedResult = formatResult<T>(
        result,
        objectMetadata,
        this.internalContext.objectMetadataMaps,
      );

      return formattedResult[0];
    } catch (error) {
      throw computeTwentyORMException(error);
    }
  }

  override async getCount(): Promise<number> {
    try {
      await this.ensureExternalStorageReady();
      this.validatePermissions();

      return await super.getCount();
    } catch (error) {
      throw computeTwentyORMException(error);
    }
  }

  override getExists(): Promise<boolean> {
    throw new PermissionsException(
      'getExists is not supported because it calls dataSource.createQueryBuilder()',
      PermissionsExceptionCode.METHOD_NOT_ALLOWED,
    );
  }

  override async getManyAndCount(): Promise<[T[], number]> {
    try {
      await this.ensureExternalStorageReady();
      this.validatePermissions();

      const mainAliasTarget = this.getMainAliasTarget();

      const objectMetadata = getObjectMetadataFromEntityTarget(
        mainAliasTarget,
        this.internalContext,
      );

      const [result, count] = await super.getManyAndCount();

      const formattedResult = formatResult<T[]>(
        result,
        objectMetadata,
        this.internalContext.objectMetadataMaps,
      );

      return [formattedResult, count];
    } catch (error) {
      throw computeTwentyORMException(error);
    }
  }

  override insert(): WorkspaceInsertQueryBuilder<T> {
    const insertQueryBuilder = super.insert();

    return new WorkspaceInsertQueryBuilder<T>(
      insertQueryBuilder,
      this.objectRecordsPermissions,
      this.internalContext,
      this.shouldBypassPermissionChecks,
      this.authContext,
      this.featureFlagMap,
    );
  }

  override update(): WorkspaceUpdateQueryBuilder<T>;

  override update(
    updateSet: QueryDeepPartialEntity<T>,
  ): WorkspaceUpdateQueryBuilder<T>;

  override update(
    updateSet?: QueryDeepPartialEntity<T>,
  ): WorkspaceUpdateQueryBuilder<T> {
    const updateQueryBuilder = updateSet
      ? super.update(updateSet)
      : super.update();

    return new WorkspaceUpdateQueryBuilder<T>(
      updateQueryBuilder,
      this.objectRecordsPermissions,
      this.internalContext,
      this.shouldBypassPermissionChecks,
      this.authContext,
      this.featureFlagMap,
    );
  }

  override delete(): WorkspaceDeleteQueryBuilder<T> {
    const deleteQueryBuilder = super.delete();

    return new WorkspaceDeleteQueryBuilder<T>(
      deleteQueryBuilder,
      this.objectRecordsPermissions,
      this.internalContext,
      this.shouldBypassPermissionChecks,
      this.authContext,
      this.featureFlagMap,
    );
  }

  private splitFieldsInExternalAndInternal(select: Record<string, boolean>) {
    const objectMetadataMapItem = getObjectMetadataMapItemByNameSingular(
      this.internalContext.objectMetadataMaps,
      this.alias,
    );

    assertIsDefinedOrThrow(objectMetadataMapItem);

    const columnNameToFieldId = getColumnNameToFieldMetadataIdMap(
      objectMetadataMapItem,
    );

    return Object.entries(columnNameToFieldId).reduce(
      (acc, [columnName, columnId]) => {
        if (isDefined(select) && !isDefined(select[columnName])) return acc;

        const field = objectMetadataMapItem.fieldsById[columnId];

        if (field.storage && field.storage !== 'postgres') {
          if (isDefined(this.externalStorageState.promise)) {
            acc.external[columnName] = true;
          }
        } else {
          acc.internal[columnName] = true;
        }

        return acc;
      },
      {
        external: {},
        internal: {},
      } as {
        external: Record<string, boolean>;
        internal: Record<string, boolean>;
      },
    );
  }

  override setFindOptions(findOptions: FindManyOptions<T>) {
    const { external } = this.splitFieldsInExternalAndInternal(
      findOptions.select as Record<string, boolean>,
    );

    Object.keys(findOptions.select).forEach((field) => {
      if (external[field]) delete findOptions.select[field];
    });

    super.setFindOptions(findOptions);

    if (Object.keys(external).length > 0) {
      Object.keys(external).forEach((field) => {
        this.addSelect(
          `"${field}Records"."${field}"`,
          `${EXTERNAL_STORAGE_ALIAS}_${this.alias}_${field}`,
        );
      });
    }

    return this;
  }

  override softDelete(): WorkspaceSoftDeleteQueryBuilder<T> {
    const softDeleteQueryBuilder = super.softDelete();

    return new WorkspaceSoftDeleteQueryBuilder<T>(
      softDeleteQueryBuilder,
      this.objectRecordsPermissions,
      this.internalContext,
      this.shouldBypassPermissionChecks,
      this.authContext,
      this.featureFlagMap,
    );
  }

  override restore(): WorkspaceSoftDeleteQueryBuilder<T> {
    const restoreQueryBuilder = super.restore();

    return new WorkspaceSoftDeleteQueryBuilder<T>(
      restoreQueryBuilder,
      this.objectRecordsPermissions,
      this.internalContext,
      this.shouldBypassPermissionChecks,
      this.authContext,
      this.featureFlagMap,
    );
  }

  override executeExistsQuery(): Promise<boolean> {
    throw new PermissionsException(
      'executeExistsQuery is not supported because it calls dataSource.createQueryBuilder()',
      PermissionsExceptionCode.METHOD_NOT_ALLOWED,
    );
  }

  private validatePermissions(): void {
    validateQueryIsPermittedOrThrow({
      expressionMap: this.expressionMap,
      objectsPermissions: this.objectRecordsPermissions,
      objectMetadataMaps: this.internalContext.objectMetadataMaps,
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
    });
  }

  private getMainAliasTarget(): EntityTarget<T> {
    const mainAliasTarget = this.expressionMap.mainAlias?.target;

    if (!mainAliasTarget) {
      throw new TwentyORMException(
        'Main alias target is missing',
        TwentyORMExceptionCode.MISSING_MAIN_ALIAS_TARGET,
      );
    }

    return mainAliasTarget;
  }
}
