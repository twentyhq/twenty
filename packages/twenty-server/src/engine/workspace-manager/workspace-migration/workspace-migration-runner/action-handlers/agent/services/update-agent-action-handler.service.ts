import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { FlatUpdateAgentAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/agent/types/workspace-migration-agent-action-builder.service';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class UpdateAgentActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'agent',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<FlatUpdateAgentAction>,
  ): Promise<FlatUpdateAgentAction> {
    return context.action;
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateAgentAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, updates } = flatAction;

    const agentRepository =
      queryRunner.manager.getRepository<AgentEntity>(AgentEntity);

    await agentRepository.update(
      { id: entityId, workspaceId },
      fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
        updates,
      }),
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateAgentAction>,
  ): Promise<void> {
    return;
  }
}
