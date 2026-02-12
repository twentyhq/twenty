import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { SkillEntity } from 'src/engine/metadata-modules/skill/entities/skill.entity';
import {
  FlatCreateSkillAction,
  UniversalCreateSkillAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/skill/types/workspace-migration-skill-action.type';
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

  override async transpileUniversalActionToFlatAction({
    action,
    flatApplication,
    workspaceId,
  }: WorkspaceMigrationActionRunnerArgs<UniversalCreateSkillAction>): Promise<FlatCreateSkillAction> {
    return {
      ...action,
      flatEntity: {
        ...action.flatEntity,
        applicationId: flatApplication.id,
        id: action.id ?? v4(),
        workspaceId,
      },
    };
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
