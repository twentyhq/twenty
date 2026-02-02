import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { FlatUpdateRoleTargetAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/role-target/types/workspace-migration-role-target-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class UpdateRoleTargetActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'roleTarget',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<FlatUpdateRoleTargetAction>,
  ): Promise<FlatUpdateRoleTargetAction> {
    return context.action;
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateRoleTargetAction>,
  ): Promise<void> {
    const { flatAction, queryRunner } = context;
    const { entityId } = flatAction;

    const roleTargetRepository =
      queryRunner.manager.getRepository<RoleTargetEntity>(RoleTargetEntity);

    const update =
      fromFlatEntityPropertiesUpdatesToPartialFlatEntity(flatAction);

    await roleTargetRepository.update(entityId, update);
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateRoleTargetAction>,
  ): Promise<void> {
    return;
  }
}
