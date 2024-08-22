import {
  DataSource,
  EntityManager,
  EntityTarget,
  ObjectLiteral,
  QueryRunner,
} from 'typeorm';

import { WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';

export class WorkspaceEntityManager extends EntityManager {
  private readonly internalContext: WorkspaceInternalContext;

  constructor(
    internalContext: WorkspaceInternalContext,
    connection: DataSource,
    queryRunner?: QueryRunner,
  ) {
    super(connection, queryRunner);
    this.internalContext = internalContext;
  }

  override getRepository<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity>,
  ): WorkspaceRepository<Entity> {
    // find already created repository instance and return it if found

    const repoFromMap = this.repositories.get(target);

    if (repoFromMap) {
      return repoFromMap as WorkspaceRepository<Entity>;
    }

    const newRepository = new WorkspaceRepository<Entity>(
      this.internalContext,
      target,
      this,
      this.queryRunner,
    );

    this.repositories.set(target, newRepository);

    return newRepository;
  }
}
