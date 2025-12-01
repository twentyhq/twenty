import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { UpdateAgentAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/agent/types/workspace-migration-v2-agent-action-builder.service';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class UpdateAgentActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update_agent',
) {
  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<UpdateAgentAction>): Partial<AllFlatEntityMaps> {
    const { flatAgentMaps } = allFlatEntityMaps;
    const { flatEntityId, flatEntityUpdates } = action;

    const existingAgent = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId,
      flatEntityMaps: flatAgentMaps,
    });

    const updatedAgent = {
      ...existingAgent,
      ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity({ updates: flatEntityUpdates }),
    };

    const updatedFlatAgentMaps = replaceFlatEntityInFlatEntityMapsOrThrow({
      flatEntity: updatedAgent,
      flatEntityMaps: flatAgentMaps,
    });

    return {
      flatAgentMaps: updatedFlatAgentMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdateAgentAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { flatEntityId, flatEntityUpdates } = action;

    const agentRepository =
      queryRunner.manager.getRepository<AgentEntity>(AgentEntity);

    await agentRepository.update(
      { id: flatEntityId, workspaceId },
      fromFlatEntityPropertiesUpdatesToPartialFlatEntity({ updates: flatEntityUpdates }),
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<UpdateAgentAction>,
  ): Promise<void> {
    return;
  }
}

