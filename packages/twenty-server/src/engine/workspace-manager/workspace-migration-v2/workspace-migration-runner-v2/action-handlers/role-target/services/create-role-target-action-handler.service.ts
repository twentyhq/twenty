import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { CreateRoleTargetAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/role-target/types/workspace-migration-role-target-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateRoleTargetActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'roleTarget',
) {
  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreateRoleTargetAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { flatEntity: roleTarget } = action;

    const roleTargetRepository =
      queryRunner.manager.getRepository<RoleTargetEntity>(RoleTargetEntity);

    await roleTargetRepository.insert({
      ...roleTarget,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<CreateRoleTargetAction>,
  ): Promise<void> {
    return;
  }
}
