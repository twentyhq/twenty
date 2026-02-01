import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { FlatCreateRoleAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/role/types/workspace-migration-role-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateRoleActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'role',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<FlatCreateRoleAction>,
  ): Promise<FlatCreateRoleAction> {
    return context.action;
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateRoleAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { flatEntity: role } = flatAction;

    const roleRepository =
      queryRunner.manager.getRepository<RoleEntity>(RoleEntity);

    await roleRepository.insert({
      ...role,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatCreateRoleAction>,
  ): Promise<void> {
    return;
  }
}
