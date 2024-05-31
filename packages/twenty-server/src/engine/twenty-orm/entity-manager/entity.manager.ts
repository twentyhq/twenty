import { EntityManager, EntityTarget, ObjectLiteral } from 'typeorm';

import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';

export class WorkspaceEntityManager extends EntityManager {
  override getRepository<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity>,
  ): WorkspaceRepository<Entity> {
    // find already created repository instance and return it if found
    const repoFromMap = this.repositories.get(target);

    if (repoFromMap) {
      return repoFromMap as WorkspaceRepository<Entity>;
    }

    const newRepository = new WorkspaceRepository<Entity>(
      target,
      this,
      this.queryRunner,
    );

    this.repositories.set(target, newRepository);

    return newRepository;
  }
}
