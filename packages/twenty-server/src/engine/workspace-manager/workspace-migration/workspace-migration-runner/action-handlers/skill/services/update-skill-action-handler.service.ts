import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { SkillEntity } from 'src/engine/metadata-modules/skill/entities/skill.entity';
import { FlatUpdateSkillAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/skill/types/workspace-migration-skill-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateSkillActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'skill',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<FlatUpdateSkillAction>,
  ): Promise<FlatUpdateSkillAction> {
    return context.action;
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateSkillAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const skillRepository =
      queryRunner.manager.getRepository<SkillEntity>(SkillEntity);

    await skillRepository.update({ id: entityId, workspaceId }, update);
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateSkillAction>,
  ): Promise<void> {
    return;
  }
}
