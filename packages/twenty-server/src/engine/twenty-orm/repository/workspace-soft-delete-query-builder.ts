import { ObjectRecordsPermissions } from 'twenty-shared/types';
import {
  DeleteQueryBuilder,
  InsertQueryBuilder,
  ObjectLiteral,
  SelectQueryBuilder,
  UpdateQueryBuilder,
  UpdateResult,
} from 'typeorm';
import { SoftDeleteQueryBuilder } from 'typeorm/query-builder/SoftDeleteQueryBuilder';

import { validateQueryIsPermittedOrThrow } from 'src/engine/twenty-orm/repository/permissions.util';
import { WorkspaceDeleteQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-delete-query-builder';
import { WorkspaceInsertQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-insert-query-builder';
import { WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { WorkspaceUpdateQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-update-query-builder';

export class WorkspaceSoftDeleteQueryBuilder<
  Entity extends ObjectLiteral,
> extends SoftDeleteQueryBuilder<Entity> {
  private objectRecordsPermissions: ObjectRecordsPermissions;
  private shouldBypassPermissionChecks: boolean;

  constructor(
    queryBuilder: SoftDeleteQueryBuilder<Entity>,
    objectRecordsPermissions: ObjectRecordsPermissions,
    shouldBypassPermissionChecks: boolean,
  ) {
    super(queryBuilder);
    this.objectRecordsPermissions = objectRecordsPermissions;
    this.shouldBypassPermissionChecks = shouldBypassPermissionChecks;
  }

  override execute(): Promise<UpdateResult> {
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

  override update(): UpdateQueryBuilder<Entity> {
    const updateQueryBuilder = super.update();

    return new WorkspaceUpdateQueryBuilder(
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

  override delete(): DeleteQueryBuilder<Entity> {
    const deleteQueryBuilder = super.delete();

    return new WorkspaceDeleteQueryBuilder(
      deleteQueryBuilder,
      this.objectRecordsPermissions,
      this.shouldBypassPermissionChecks,
    );
  }
}
