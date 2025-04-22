import { Entity } from '@microsoft/microsoft-graph-types';
import { ObjectRecordsPermissions } from 'twenty-shared/types';
import { ObjectLiteral, SelectQueryBuilder, UpdateQueryBuilder } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { validateQueryIsPermittedOrThrow } from 'src/engine/twenty-orm/repository/permissions.util';
import { WorkspaceDeleteQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-delete-query-builder';
import { WorkspaceSoftDeleteQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-soft-delete-query-builder';
import { WorkspaceUpdateQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-update-query-builder';

export class WorkspaceSelectQueryBuilder<
  T extends ObjectLiteral,
> extends SelectQueryBuilder<T> {
  objectRecordsPermissions: ObjectRecordsPermissions;
  shouldBypassPermissionChecks: boolean;
  constructor(
    queryBuilder: SelectQueryBuilder<T>,
    objectRecordsPermissions: ObjectRecordsPermissions,
    shouldBypassPermissionChecks: boolean,
  ) {
    super(queryBuilder);
    this.objectRecordsPermissions = objectRecordsPermissions;
    this.shouldBypassPermissionChecks = shouldBypassPermissionChecks;
  }

  override clone(): this {
    const clonedQueryBuilder = super.clone();

    return new WorkspaceSelectQueryBuilder(
      clonedQueryBuilder,
      this.objectRecordsPermissions,
      this.shouldBypassPermissionChecks,
    ) as this;
  }

  override execute(): Promise<T[]> {
    validateQueryIsPermittedOrThrow(
      this.expressionMap,
      this.objectRecordsPermissions,
      this.shouldBypassPermissionChecks,
    );

    return super.execute();
  }

  override getOne(): Promise<T | null> {
    validateQueryIsPermittedOrThrow(
      this.expressionMap,
      this.objectRecordsPermissions,
      this.shouldBypassPermissionChecks,
    );

    return super.getOne();
  }

  override getOneOrFail(): Promise<T> {
    validateQueryIsPermittedOrThrow(
      this.expressionMap,
      this.objectRecordsPermissions,
      this.shouldBypassPermissionChecks,
    );

    return super.getOneOrFail();
  }

  override getMany(): Promise<T[]> {
    validateQueryIsPermittedOrThrow(
      this.expressionMap,
      this.objectRecordsPermissions,
      this.shouldBypassPermissionChecks,
    );

    return super.getMany();
  }

  override getManyAndCount(): Promise<[T[], number]> {
    validateQueryIsPermittedOrThrow(
      this.expressionMap,
      this.objectRecordsPermissions,
      this.shouldBypassPermissionChecks,
    );

    return super.getManyAndCount();
  }

  override getRawOne<U = any>(): Promise<U | undefined> {
    validateQueryIsPermittedOrThrow(
      this.expressionMap,
      this.objectRecordsPermissions,
      this.shouldBypassPermissionChecks,
    );

    return super.getRawOne<U>();
  }

  override getRawMany<U = any>(): Promise<U[]> {
    validateQueryIsPermittedOrThrow(
      this.expressionMap,
      this.objectRecordsPermissions,
      this.shouldBypassPermissionChecks,
    );

    return super.getRawMany<U>();
  }

  override getRawAndEntities<U = any>(): Promise<{
    entities: T[];
    raw: U[];
  }> {
    validateQueryIsPermittedOrThrow(
      this.expressionMap,
      this.objectRecordsPermissions,
      this.shouldBypassPermissionChecks,
    );

    return super.getRawAndEntities();
  }

  override getCount(): Promise<number> {
    validateQueryIsPermittedOrThrow(
      this.expressionMap,
      this.objectRecordsPermissions,
      this.shouldBypassPermissionChecks,
    );

    return super.getCount();
  }

  override getExists(): Promise<boolean> {
    validateQueryIsPermittedOrThrow(
      this.expressionMap,
      this.objectRecordsPermissions,
      this.shouldBypassPermissionChecks,
    );

    return super.getExists();
  }

  override stream(): Promise<any> {
    validateQueryIsPermittedOrThrow(
      this.expressionMap,
      this.objectRecordsPermissions,
      this.shouldBypassPermissionChecks,
    );

    return super.stream();
  }

  override update(): WorkspaceUpdateQueryBuilder<T>;

  override update(
    updateSet: QueryDeepPartialEntity<T>,
  ): WorkspaceUpdateQueryBuilder<T>;

  override update(
    updateSet?: QueryDeepPartialEntity<T>,
  ): UpdateQueryBuilder<T> {
    const updateQueryBuilder = updateSet
      ? super.update(updateSet)
      : super.update();

    return new WorkspaceUpdateQueryBuilder<T>(
      updateQueryBuilder,
      this.objectRecordsPermissions,
      this.shouldBypassPermissionChecks,
    );
  }

  override delete(): WorkspaceDeleteQueryBuilder<T> {
    const deleteQueryBuilder = super.delete();

    return new WorkspaceDeleteQueryBuilder<T>(
      deleteQueryBuilder,
      this.objectRecordsPermissions,
      this.shouldBypassPermissionChecks,
    );
  }

  override softDelete(): WorkspaceSoftDeleteQueryBuilder<Entity> {
    const softDeleteQueryBuilder = super.softDelete();

    return new WorkspaceSoftDeleteQueryBuilder<Entity>(
      softDeleteQueryBuilder,
      this.objectRecordsPermissions,
      this.shouldBypassPermissionChecks,
    );
  }

  override restore(): WorkspaceSoftDeleteQueryBuilder<Entity> {
    const restoreQueryBuilder = super.restore();

    return new WorkspaceSoftDeleteQueryBuilder<Entity>(
      restoreQueryBuilder,
      this.objectRecordsPermissions,
      this.shouldBypassPermissionChecks,
    );
  }
}
