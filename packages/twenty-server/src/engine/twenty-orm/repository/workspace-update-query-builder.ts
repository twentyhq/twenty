import { ObjectRecordsPermissions } from 'twenty-shared/types';
import { ObjectLiteral, UpdateQueryBuilder, UpdateResult } from 'typeorm';

import { WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { validateQueryIsPermittedOrThrow } from 'src/engine/twenty-orm/repository/permissions.util';

export class WorkspaceUpdateQueryBuilder<
  Entity extends ObjectLiteral,
> extends UpdateQueryBuilder<Entity> {
  private objectRecordsPermissions: ObjectRecordsPermissions;
  private shouldBypassPermissionChecks: boolean;
  private internalContext: WorkspaceInternalContext;
  constructor(
    queryBuilder: UpdateQueryBuilder<Entity>,
    objectRecordsPermissions: ObjectRecordsPermissions,
    internalContext: WorkspaceInternalContext,
    shouldBypassPermissionChecks: boolean,
  ) {
    super(queryBuilder);
    this.objectRecordsPermissions = objectRecordsPermissions;
    this.internalContext = internalContext;
    this.shouldBypassPermissionChecks = shouldBypassPermissionChecks;
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
}
