import { ObjectRecordsPermissions } from 'twenty-shared/types';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

import { WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';

export class WorkspaceQueryBuilder<
  T extends ObjectLiteral,
> extends WorkspaceSelectQueryBuilder<T> {
  constructor(
    queryBuilder: SelectQueryBuilder<T>,
    objectRecordsPermissions: ObjectRecordsPermissions,
    internalContext: WorkspaceInternalContext,
    shouldBypassPermissionChecks: boolean,
  ) {
    super(
      queryBuilder,
      objectRecordsPermissions,
      internalContext,
      shouldBypassPermissionChecks,
    );
  }

  override clone(): this {
    const clonedQueryBuilder = super.clone();

    return new WorkspaceQueryBuilder(
      clonedQueryBuilder,
      this.objectRecordsPermissions,
      this.internalContext,
      this.shouldBypassPermissionChecks,
    ) as this;
  }
}
