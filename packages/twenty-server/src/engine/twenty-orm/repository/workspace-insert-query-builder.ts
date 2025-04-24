import { ObjectRecordsPermissions } from 'twenty-shared/types';
import { InsertQueryBuilder, ObjectLiteral, SelectQueryBuilder } from 'typeorm';

import { WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

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
  private internalContext: WorkspaceInternalContext;

  constructor(
    queryBuilder: InsertQueryBuilder<Entity>,
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

    return new WorkspaceInsertQueryBuilder(
      clonedQueryBuilder,
      this.objectRecordsPermissions,
      this.internalContext,
      this.shouldBypassPermissionChecks,
    ) as this;
  }

  override execute(): Promise<any> {
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

  override update(): WorkspaceUpdateQueryBuilder<Entity> {
    const updateQueryBuilder = super.update();

    return new WorkspaceUpdateQueryBuilder(
      updateQueryBuilder,
      this.objectRecordsPermissions,
      this.internalContext,
      this.shouldBypassPermissionChecks,
    );
  }

  override delete(): WorkspaceDeleteQueryBuilder<Entity> {
    const deleteQueryBuilder = super.delete();

    return new WorkspaceDeleteQueryBuilder<Entity>(
      deleteQueryBuilder,
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
