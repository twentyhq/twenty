import { QueryRunner } from 'typeorm';

import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/entity.manager';

interface WorkspaceQueryRunner extends Omit<QueryRunner, 'manager'> {
  manager: WorkspaceEntityManager;
}

export { WorkspaceQueryRunner };
