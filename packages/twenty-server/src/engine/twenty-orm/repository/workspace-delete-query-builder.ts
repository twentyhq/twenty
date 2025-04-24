import { ObjectRecordsPermissions } from 'twenty-shared/types';
import {
  DeleteQueryBuilder,
  DeleteResult,
  InsertQueryBuilder,
  ObjectLiteral,
  SelectQueryBuilder,
  UpdateQueryBuilder,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { validateQueryIsPermittedOrThrow } from 'src/engine/twenty-orm/repository/permissions.util';
import { WorkspaceInsertQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-insert-query-builder';
import { WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { WorkspaceSoftDeleteQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-soft-delete-query-builder';
import { WorkspaceUpdateQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-update-query-builder';

export class WorkspaceDeleteQueryBuilder<
  Entity extends ObjectLiteral,
> extends DeleteQueryBuilder<Entity> {
  private objectRecordsPermissions: ObjectRecordsPermissions;
  private shouldBypassPermissionChecks: boolean;
  private internalContext: WorkspaceInternalContext;
  constructor(
    queryBuilder: DeleteQueryBuilder<Entity>,
    objectRecordsPermissions: ObjectRecordsPermissions,
    internalContext: WorkspaceInternalContext,
    shouldBypassPermissionChecks: boolean,
  ) {
    super(queryBuilder);
    this.objectRecordsPermissions = objectRecordsPermissions;
    this.internalContext = internalContext;
    this.shouldBypassPermissionChecks = shouldBypassPermissionChecks;
  }

  override clone(): this {
    const clonedQueryBuilder = super.clone();

    return new WorkspaceDeleteQueryBuilder(
      clonedQueryBuilder,
      this.objectRecordsPermissions,
      this.internalContext,
      this.shouldBypassPermissionChecks,
    ) as this;
  }

  override execute(): Promise<DeleteResult> {
    validateQueryIsPermittedOrThrow(
      this.expressionMap,
      this.objectRecordsPermissions,
      this.internalContext.objectMetadataMaps,
      this.shouldBypassPermissionChecks,
    );

    return super.execute();
  }

  override select(): SelectQueryBuilder<Entity> {
    const selectQueryBuilder = super.select();

    return new WorkspaceSelectQueryBuilder(
      selectQueryBuilder,
      this.objectRecordsPermissions,
      this.internalContext,
      this.shouldBypassPermissionChecks,
    );
  }

  override update(): WorkspaceUpdateQueryBuilder<Entity>;

  override update(
    updateSet: QueryDeepPartialEntity<Entity>,
  ): WorkspaceUpdateQueryBuilder<Entity>;

  override update(
    updateSet?: QueryDeepPartialEntity<Entity>,
  ): UpdateQueryBuilder<Entity> {
    const updateQueryBuilder = updateSet
      ? super.update(updateSet)
      : super.update();

    return new WorkspaceUpdateQueryBuilder<Entity>(
      updateQueryBuilder,
      this.objectRecordsPermissions,
      this.internalContext,
      this.shouldBypassPermissionChecks,
    );
  }

  override insert(): InsertQueryBuilder<Entity> {
    const insertQueryBuilder = super.insert();

    return new WorkspaceInsertQueryBuilder(
      insertQueryBuilder,
      this.objectRecordsPermissions,
      this.internalContext,
      this.shouldBypassPermissionChecks,
    );
  }

  override softDelete(): WorkspaceSoftDeleteQueryBuilder<Entity> {
    const softDeleteQueryBuilder = super.softDelete();

    return new WorkspaceSoftDeleteQueryBuilder<Entity>(
      softDeleteQueryBuilder,
      this.objectRecordsPermissions,
      this.internalContext,
      this.shouldBypassPermissionChecks,
    );
  }

  override restore(): WorkspaceSoftDeleteQueryBuilder<Entity> {
    const restoreQueryBuilder = super.restore();

    return new WorkspaceSoftDeleteQueryBuilder<Entity>(
      restoreQueryBuilder,
      this.objectRecordsPermissions,
      this.internalContext,
      this.shouldBypassPermissionChecks,
    );
  }
}
