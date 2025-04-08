import { ObjectRecordsPermissions } from 'twenty-shared/types';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

import { WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';

export class WorkspaceQueryBuilder<
  T extends ObjectLiteral,
> extends WorkspaceSelectQueryBuilder<T> {
  constructor(
    queryBuilder: SelectQueryBuilder<T>,
    objectRecordsPermissions: ObjectRecordsPermissions,
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
