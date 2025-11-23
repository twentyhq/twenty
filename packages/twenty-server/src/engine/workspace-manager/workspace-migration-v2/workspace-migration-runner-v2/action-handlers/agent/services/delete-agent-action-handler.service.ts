import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { type DeleteAgentAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/agent/types/workspace-migration-agent-action-v2.type';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

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
    const { agentId } = action;

    const updatedFlatAgentMaps = deleteFlatEntityFromFlatEntityMapsOrThrow({
      entityToDeleteId: agentId,
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
    const { agentId } = action;

    const agentRepository =
      queryRunner.manager.getRepository<AgentEntity>(AgentEntity);

    await agentRepository.delete({
      id: agentId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<DeleteAgentAction>,
  ): Promise<void> {
    return;
  }
}

