import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { UpdateRoleTargetAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/role-target/types/workspace-migration-role-target-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class UpdateRoleTargetActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'roleTarget',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdateRoleTargetAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const { entityId } = action;

    const roleTargetRepository =
      queryRunner.manager.getRepository<RoleTargetEntity>(RoleTargetEntity);

    const update = fromFlatEntityPropertiesUpdatesToPartialFlatEntity(action);

    await roleTargetRepository.update(entityId, update);
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<UpdateRoleTargetAction>,
  ): Promise<void> {
    return;
  }
}
