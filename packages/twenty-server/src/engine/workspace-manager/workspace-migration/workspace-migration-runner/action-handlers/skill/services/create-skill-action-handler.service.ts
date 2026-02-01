import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { SkillEntity } from 'src/engine/metadata-modules/skill/entities/skill.entity';
import { FlatCreateSkillAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/skill/types/workspace-migration-skill-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateSkillActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'skill',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<FlatCreateSkillAction>,
  ): Promise<FlatCreateSkillAction> {
    return context.action;
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateSkillAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { flatEntity } = flatAction;

    const skillRepository =
      queryRunner.manager.getRepository<SkillEntity>(SkillEntity);

    await skillRepository.save({
      ...flatEntity,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatCreateSkillAction>,
  ): Promise<void> {
    return;
  }
}
