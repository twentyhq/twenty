import { ObjectRecordsPermissions } from 'twenty-shared/types';
import { ObjectLiteral, UpdateQueryBuilder, UpdateResult } from 'typeorm';

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
    return super.execute();
  }
}
