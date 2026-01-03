import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { DeleteRoleTargetAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/role-target/types/workspace-migration-role-target-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteRoleTargetActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'roleTarget',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteRoleTargetAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { entityId } = action;

    const roleTargetRepository =
      queryRunner.manager.getRepository<RoleTargetEntity>(RoleTargetEntity);

    await roleTargetRepository.delete({
      id: entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<DeleteRoleTargetAction>,
  ): Promise<void> {
    return;
  }
}
