import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { DeleteRoleAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/role/types/workspace-migration-role-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteRoleActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'role',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteRoleAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { entityId } = action;

    const roleRepository =
      queryRunner.manager.getRepository<RoleEntity>(RoleEntity);

    await roleRepository.delete({ id: entityId, workspaceId });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<DeleteRoleAction>,
  ): Promise<void> {
    return;
  }
}
