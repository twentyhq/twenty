import { ObjectRecordsPermissions } from 'twenty-shared/types';
import {
  InsertQueryBuilder,
  ObjectLiteral,
  SelectQueryBuilder,
  UpdateQueryBuilder,
} from 'typeorm';

import { validateQueryIsPermittedOrThrow } from 'src/engine/twenty-orm/repository/permissions.util';
import { WorkspaceDeleteQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-delete-query-builder';
import { WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { WorkspaceSoftDeleteQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-soft-delete-query-builder';
import { WorkspaceUpdateQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-update-query-builder';

export class WorkspaceInsertQueryBuilder<
  Entity extends ObjectLiteral,
> extends InsertQueryBuilder<Entity> {
  private objectRecordsPermissions: ObjectRecordsPermissions;
  private shouldBypassPermissionChecks: boolean;

  constructor(
    queryBuilder: InsertQueryBuilder<Entity>,
    objectRecordsPermissions: ObjectRecordsPermissions,
    shouldBypassPermissionChecks: boolean,
  ) {
    super(queryBuilder);
    this.objectRecordsPermissions = objectRecordsPermissions;
    this.shouldBypassPermissionChecks = shouldBypassPermissionChecks;
  }

  override execute(): Promise<any> {
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

  override delete(): WorkspaceDeleteQueryBuilder<Entity> {
    const deleteQueryBuilder = super.delete();

    return new WorkspaceDeleteQueryBuilder<Entity>(
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
