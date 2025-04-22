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

  constructor(
    queryBuilder: DeleteQueryBuilder<Entity>,
    objectRecordsPermissions: ObjectRecordsPermissions,
    shouldBypassPermissionChecks: boolean,
  ) {
    super(queryBuilder);
    this.objectRecordsPermissions = objectRecordsPermissions;
    this.shouldBypassPermissionChecks = shouldBypassPermissionChecks;
  }

  override execute(): Promise<DeleteResult> {
    validateQueryIsPermittedOrThrow(
      this.expressionMap,
      this.objectRecordsPermissions,
      this.shouldBypassPermissionChecks,
    );

    return super.execute();
  }

  override select(): SelectQueryBuilder<Entity> {
    const selectQueryBuilder = super.select();

    return new WorkspaceSelectQueryBuilder(
      selectQueryBuilder,
      this.objectRecordsPermissions,
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
      this.shouldBypassPermissionChecks,
    );
  }

  override insert(): InsertQueryBuilder<Entity> {
    const insertQueryBuilder = super.insert();

    return new WorkspaceInsertQueryBuilder(
      insertQueryBuilder,
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
