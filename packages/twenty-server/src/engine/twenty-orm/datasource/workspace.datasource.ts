import {
  DataSource,
  EntityManager,
  EntityTarget,
  ObjectLiteral,
  QueryRunner,
} from 'typeorm';

import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/entity.manager';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';

export class WorkspaceDataSource extends DataSource {
  readonly manager: WorkspaceEntityManager;

  override getRepository<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity>,
  ): WorkspaceRepository<Entity> {
    return this.manager.getRepository(target);
  }

  override createEntityManager(queryRunner?: QueryRunner): EntityManager {
    return new WorkspaceEntityManager(this, queryRunner);
  }
}
