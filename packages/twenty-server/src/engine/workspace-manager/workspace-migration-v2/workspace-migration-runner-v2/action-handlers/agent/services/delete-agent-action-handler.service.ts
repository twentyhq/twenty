import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { DeleteAgentAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/agent/types/workspace-migration-v2-agent-action-builder.service';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteAgentActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'agent',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteAgentAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { entityId } = action;

    const agentRepository =
      queryRunner.manager.getRepository<AgentEntity>(AgentEntity);

    await agentRepository.delete({ id: entityId, workspaceId });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<DeleteAgentAction>,
  ): Promise<void> {
    return;
  }
}
