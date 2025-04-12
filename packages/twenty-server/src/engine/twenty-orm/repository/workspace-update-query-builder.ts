import { ObjectRecordsPermissions } from 'twenty-shared/types';
import { ObjectLiteral, UpdateQueryBuilder, UpdateResult } from 'typeorm';

import { validateQueryIsPermittedOrThrow } from 'src/engine/twenty-orm/repository/permissions.util';

export class WorkspaceUpdateQueryBuilder<
  Entity extends ObjectLiteral,
> extends UpdateQueryBuilder<Entity> {
  private objectRecordsPermissions: ObjectRecordsPermissions;
  constructor(
    queryBuilder: UpdateQueryBuilder<Entity>,
    objectRecordsPermissions: ObjectRecordsPermissions,
  ) {
    super(queryBuilder);
    this.objectRecordsPermissions = objectRecordsPermissions;
  }

  override execute(): Promise<UpdateResult> {
    validateQueryIsPermittedOrThrow(
      this.expressionMap,
      this.objectRecordsPermissions,
    );

    return super.execute();
  }
}
