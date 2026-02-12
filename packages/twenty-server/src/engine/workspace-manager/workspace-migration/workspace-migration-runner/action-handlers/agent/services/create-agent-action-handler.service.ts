import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import {
  FlatCreateAgentAction,
  UniversalCreateAgentAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/agent/types/workspace-migration-agent-action-builder.service';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateAgentActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'agent',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction({
    action,
    flatApplication,
    workspaceId,
  }: WorkspaceMigrationActionRunnerArgs<UniversalCreateAgentAction>): Promise<FlatCreateAgentAction> {
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
    context: WorkspaceMigrationActionRunnerContext<FlatCreateAgentAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { flatEntity } = flatAction;

    const agentRepository =
      queryRunner.manager.getRepository<AgentEntity>(AgentEntity);

    await agentRepository.save({
      ...flatEntity,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatCreateAgentAction>,
  ): Promise<void> {
    return;
  }
}
