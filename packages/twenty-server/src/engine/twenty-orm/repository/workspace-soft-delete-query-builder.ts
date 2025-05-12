import { ObjectRecordsPermissions } from 'twenty-shared/types';
import { InsertQueryBuilder, ObjectLiteral, UpdateResult } from 'typeorm';
import { SoftDeleteQueryBuilder } from 'typeorm/query-builder/SoftDeleteQueryBuilder';

import { WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { validateQueryIsPermittedOrThrow } from 'src/engine/twenty-orm/repository/permissions.utils';
import { WorkspaceDeleteQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-delete-query-builder';
import { WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { WorkspaceUpdateQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-update-query-builder';

export class WorkspaceSoftDeleteQueryBuilder<
  T extends ObjectLiteral,
> extends SoftDeleteQueryBuilder<T> {
  private objectRecordsPermissions: ObjectRecordsPermissions;
  private shouldBypassPermissionChecks: boolean;
  private internalContext: WorkspaceInternalContext;

  constructor(
    queryBuilder: SoftDeleteQueryBuilder<T>,
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

    return new WorkspaceSoftDeleteQueryBuilder(
      clonedQueryBuilder,
      this.objectRecordsPermissions,
      this.internalContext,
      this.shouldBypassPermissionChecks,
    ) as this;
  }

  override execute(): Promise<UpdateResult> {
    validateQueryIsPermittedOrThrow(
      this.expressionMap,
      this.objectRecordsPermissions,
      this.internalContext.objectMetadataMaps,
      this.shouldBypassPermissionChecks,
    );

    return super.execute();
  }

  override select(): WorkspaceSelectQueryBuilder<T> {
    throw new Error('This builder cannot morph into a select builder');
  }

  override update(): WorkspaceUpdateQueryBuilder<T> {
    throw new Error('This builder cannot morph into an update builder');
  }

  override insert(): InsertQueryBuilder<T> {
    throw new Error('This builder cannot morph into an insert builder');
  }

  override delete(): WorkspaceDeleteQueryBuilder<T> {
    throw new Error('This builder cannot morph into a delete builder');
  }
}
