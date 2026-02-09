import { type ObjectsPermissions } from 'twenty-shared/types';
import {
  type EntityTarget,
  type ObjectLiteral,
  SelectQueryBuilder,
} from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

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
import { applyRowLevelPermissionPredicates } from 'src/engine/twenty-orm/utils/apply-row-level-permission-predicates.util';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { getObjectMetadataFromEntityTarget } from 'src/engine/twenty-orm/utils/get-object-metadata-from-entity-target.util';

export class WorkspaceSelectQueryBuilder<
  T extends ObjectLiteral,
> extends SelectQueryBuilder<T> {
  objectRecordsPermissions: ObjectsPermissions;
  shouldBypassPermissionChecks: boolean;
  internalContext: WorkspaceInternalContext;
  authContext: AuthContext;
  featureFlagMap: FeatureFlagMap;
  constructor(
    queryBuilder: SelectQueryBuilder<T>,
    objectRecordsPermissions: ObjectsPermissions,
    internalContext: WorkspaceInternalContext,
    shouldBypassPermissionChecks: boolean,
    authContext: AuthContext,
    featureFlagMap: FeatureFlagMap,
  ) {
    super(queryBuilder);
    this.objectRecordsPermissions = objectRecordsPermissions;
    this.internalContext = internalContext;
    this.shouldBypassPermissionChecks = shouldBypassPermissionChecks;
    this.authContext = authContext;
    this.featureFlagMap = featureFlagMap;
  }

  getFindOptions() {
    return this.findOptions;
  }

  override clone(): this {
    const clonedQueryBuilder = super.clone();

    const workspaceSelectQueryBuilder = new WorkspaceSelectQueryBuilder(
      clonedQueryBuilder,
      this.objectRecordsPermissions,
      this.internalContext,
      this.shouldBypassPermissionChecks,
      this.authContext,
      this.featureFlagMap,
    ) as this;

    return workspaceSelectQueryBuilder;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async execute(): Promise<any> {
    try {
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
        this.internalContext.flatObjectMetadataMaps,
        this.internalContext.flatFieldMetadataMaps,
      );

      return {
        raw: result,
        generatedMaps: formattedResult,
        identifiers: result.identifiers,
      };
    } catch (error) {
      throw await computeTwentyORMException(error);
    }
  }

  override async getMany(): Promise<T[]> {
    try {
      this.validatePermissions();

      const mainAliasTarget = this.getMainAliasTarget();

      const objectMetadata = getObjectMetadataFromEntityTarget(
        mainAliasTarget,
        this.internalContext,
      );

      const result = await super.getMany();

      const formattedResult = formatResult<T[]>(
        result,
        objectMetadata,
        this.internalContext.flatObjectMetadataMaps,
        this.internalContext.flatFieldMetadataMaps,
      );

      return formattedResult;
    } catch (error) {
      throw await computeTwentyORMException(error);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async getRawOne<U = any>(): Promise<U | undefined> {
    try {
      this.validatePermissions();

      return super.getRawOne();
    } catch (error) {
      throw await computeTwentyORMException(error);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async getRawMany<U = any>(): Promise<U[]> {
    try {
      this.validatePermissions();

      return super.getRawMany();
    } catch (error) {
      throw await computeTwentyORMException(error);
    }
  }

  override async getOne(): Promise<T | null> {
    try {
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
        this.internalContext.flatObjectMetadataMaps,
        this.internalContext.flatFieldMetadataMaps,
      );

      return formattedResult;
    } catch (error) {
      throw await computeTwentyORMException(error);
    }
  }

  override async getOneOrFail(): Promise<T> {
    try {
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
        this.internalContext.flatObjectMetadataMaps,
        this.internalContext.flatFieldMetadataMaps,
      );

      return formattedResult[0];
    } catch (error) {
      throw await computeTwentyORMException(error);
    }
  }

  override async getCount(): Promise<number> {
    try {
      this.validatePermissions();

      return super.getCount();
    } catch (error) {
      throw await computeTwentyORMException(error);
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
        this.internalContext.flatObjectMetadataMaps,
        this.internalContext.flatFieldMetadataMaps,
      );

      return [formattedResult, count];
    } catch (error) {
      throw await computeTwentyORMException(error);
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
    this.applyRowLevelPermissionPredicates();
    validateQueryIsPermittedOrThrow({
      expressionMap: this.expressionMap,
      objectsPermissions: this.objectRecordsPermissions,
      flatObjectMetadataMaps: this.internalContext.flatObjectMetadataMaps,
      flatFieldMetadataMaps: this.internalContext.flatFieldMetadataMaps,
      objectIdByNameSingular: this.internalContext.objectIdByNameSingular,
      shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
    });
  }

  private getMainAliasTarget(): EntityTarget<T> {
    const mainAlias = this.expressionMap.mainAlias;

    const mainAliasTarget = mainAlias?.target;

    if (!mainAliasTarget) {
      throw new TwentyORMException(
        'Main alias target is missing',
        TwentyORMExceptionCode.MISSING_MAIN_ALIAS_TARGET,
      );
    }

    return mainAliasTarget;
  }

  private applyRowLevelPermissionPredicates(): void {
    if (this.shouldBypassPermissionChecks) {
      return;
    }

    // Subqueries don't have entity metadata, skip permission predicates
    // Permissions are already applied on the original entity query
    if (this.expressionMap.mainAlias?.subQuery) {
      return;
    }

    const mainAliasTarget = this.getMainAliasTarget();

    const objectMetadata = getObjectMetadataFromEntityTarget(
      mainAliasTarget,
      this.internalContext,
    );

    applyRowLevelPermissionPredicates({
      queryBuilder: this,
      objectMetadata,
      internalContext: this.internalContext,
      authContext: this.authContext,
      featureFlagMap: this.featureFlagMap,
    });
  }
}
