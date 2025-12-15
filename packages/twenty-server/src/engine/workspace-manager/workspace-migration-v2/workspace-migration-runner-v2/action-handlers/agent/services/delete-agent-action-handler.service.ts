import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { DeleteAgentAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/agent/types/workspace-migration-v2-agent-action-builder.service';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteAgentActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete_agent',
) {
  constructor() {
    super();
  }

  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<DeleteAgentAction>): Partial<AllFlatEntityMaps> {
    const { flatAgentMaps } = allFlatEntityMaps;
    const { flatEntityId } = action;

    const updatedFlatAgentMaps = deleteFlatEntityFromFlatEntityMapsOrThrow({
      entityToDeleteId: flatEntityId,
      flatEntityMaps: flatAgentMaps,
    });

    return {
      flatAgentMaps: updatedFlatAgentMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteAgentAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { flatEntityId } = action;

    const agentRepository =
      queryRunner.manager.getRepository<AgentEntity>(AgentEntity);

    await agentRepository.delete({ id: flatEntityId, workspaceId });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<DeleteAgentAction>,
  ): Promise<void> {
    return;
  }
}
