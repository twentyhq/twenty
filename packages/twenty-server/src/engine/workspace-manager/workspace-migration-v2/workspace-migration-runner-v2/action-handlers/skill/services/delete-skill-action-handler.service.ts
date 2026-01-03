import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { SkillEntity } from 'src/engine/metadata-modules/skill/entities/skill.entity';
import { DeleteSkillAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/skill/types/workspace-migration-v2-skill-action.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteSkillActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'skill',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteSkillAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { entityId } = action;

    const skillRepository =
      queryRunner.manager.getRepository<SkillEntity>(SkillEntity);

    await skillRepository.delete({ id: entityId, workspaceId });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<DeleteSkillAction>,
  ): Promise<void> {
    return;
  }
}
