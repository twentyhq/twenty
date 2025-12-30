import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { SkillEntity } from 'src/engine/metadata-modules/skill/entities/skill.entity';
import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { DeleteSkillAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/skill/types/workspace-migration-v2-skill-action.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteSkillActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete_skill',
) {
  constructor() {
    super();
  }

  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<DeleteSkillAction>): Partial<AllFlatEntityMaps> {
    const { flatSkillMaps } = allFlatEntityMaps;
    const { flatEntityId } = action;

    const updatedFlatSkillMaps = deleteFlatEntityFromFlatEntityMapsOrThrow({
      entityToDeleteId: flatEntityId,
      flatEntityMaps: flatSkillMaps,
    });

    return {
      flatSkillMaps: updatedFlatSkillMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteSkillAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { flatEntityId } = action;

    const skillRepository =
      queryRunner.manager.getRepository<SkillEntity>(SkillEntity);

    await skillRepository.delete({ id: flatEntityId, workspaceId });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<DeleteSkillAction>,
  ): Promise<void> {
    return;
  }
}
