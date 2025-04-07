import { PermissionsOnAllObjectRecords } from 'twenty-shared/constants';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

import { WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';

export class WorkspaceQueryBuilder<
  T extends ObjectLiteral,
> extends WorkspaceSelectQueryBuilder<T> {
  constructor(
    queryBuilder: SelectQueryBuilder<T>,
    objectRecordsPermissions: Record<PermissionsOnAllObjectRecords, boolean>,
  ) {
    super(queryBuilder, objectRecordsPermissions);
    this.objectRecordsPermissions = objectRecordsPermissions;
  }

  override clone(): this {
    const clonedQueryBuilder = super.clone();

    return new WorkspaceQueryBuilder(
      clonedQueryBuilder,
      this.objectRecordsPermissions,
    ) as this;
  }
}
