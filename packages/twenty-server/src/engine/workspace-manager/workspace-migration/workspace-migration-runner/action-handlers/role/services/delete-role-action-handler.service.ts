import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { FlatDeleteRoleAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/role/types/workspace-migration-role-action.type';
import { WorkspaceMigrationActionRunnerContext } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteRoleActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'role',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteRoleAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const roleRepository =
      queryRunner.manager.getRepository<RoleEntity>(RoleEntity);

    await roleRepository.delete({ id: flatAction.entityId, workspaceId });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteRoleAction>,
  ): Promise<void> {
    return;
  }
}
