import { PermissionsOnAllObjectRecords } from 'twenty-shared/constants';
import {
  DataSource,
  DataSourceOptions,
  EntityTarget,
  ObjectLiteral,
  QueryRunner,
} from 'typeorm';

import { WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/entity.manager';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';

export class WorkspaceDataSource extends DataSource {
  readonly internalContext: WorkspaceInternalContext;
  readonly manager: WorkspaceEntityManager;

  constructor(
    internalContext: WorkspaceInternalContext,
    options: DataSourceOptions,
  ) {
    super(options);
    this.internalContext = internalContext;
    // Recreate manager after internalContext has been initialized
    this.manager = this.createEntityManager();
  }

  override getRepository<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity>,
    objectRecordsPermissions?: Record<PermissionsOnAllObjectRecords, boolean>,
  ): WorkspaceRepository<Entity> {
    return this.manager.getRepository(target, objectRecordsPermissions);
  }

  override createEntityManager(
    queryRunner?: QueryRunner,
  ): WorkspaceEntityManager {
    return new WorkspaceEntityManager(this.internalContext, this, queryRunner);
  }
}
