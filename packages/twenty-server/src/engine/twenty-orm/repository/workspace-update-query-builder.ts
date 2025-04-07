import { PermissionsOnAllObjectRecords } from 'twenty-shared/constants';
import { ObjectLiteral, UpdateQueryBuilder, UpdateResult } from 'typeorm';

export class WorkspaceUpdateQueryBuilder<
  Entity extends ObjectLiteral,
> extends UpdateQueryBuilder<Entity> {
  private objectRecordsPermissions: Record<
    PermissionsOnAllObjectRecords,
    boolean
  >;
  constructor(
    queryBuilder: UpdateQueryBuilder<Entity>,
    objectRecordsPermissions: Record<PermissionsOnAllObjectRecords, boolean>,
  ) {
    super(queryBuilder);
    this.objectRecordsPermissions = objectRecordsPermissions;
  }

  override execute(): Promise<UpdateResult> {
    return super.execute();
  }
}
