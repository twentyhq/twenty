import { ObjectRecordsPermissions } from 'twenty-shared/types';
import { ObjectLiteral, UpdateQueryBuilder, UpdateResult } from 'typeorm';

import { WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { validateQueryIsPermittedOrThrow } from 'src/engine/twenty-orm/repository/permissions.utils';
import { WorkspaceDeleteQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-delete-query-builder';
import { WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { WorkspaceSoftDeleteQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-soft-delete-query-builder';

export class WorkspaceUpdateQueryBuilder<
  T extends ObjectLiteral,
> extends UpdateQueryBuilder<T> {
  private objectRecordsPermissions: ObjectRecordsPermissions;
  private shouldBypassPermissionChecks: boolean;
  private internalContext: WorkspaceInternalContext;
  constructor(
    queryBuilder: UpdateQueryBuilder<T>,
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

    return new WorkspaceUpdateQueryBuilder(
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

  override delete(): WorkspaceDeleteQueryBuilder<T> {
    throw new Error('This builder cannot morph into a delete builder');
  }

  override softDelete(): WorkspaceSoftDeleteQueryBuilder<T> {
    throw new Error('This builder cannot morph into a soft delete builder');
  }

  override restore(): WorkspaceSoftDeleteQueryBuilder<T> {
    throw new Error('This builder cannot morph into a soft delete builder');
  }
}
