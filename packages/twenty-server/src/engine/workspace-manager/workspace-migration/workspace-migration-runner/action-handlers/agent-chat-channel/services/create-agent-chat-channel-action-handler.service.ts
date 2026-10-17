import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { getUniversalFlatEntityEmptyForeignKeyAggregators } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/reset-universal-flat-entity-foreign-key-aggregators.util';
import {
  FlatCreateAgentChatChannelAction,
  UniversalCreateAgentChatChannelAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/agent-chat-channel/types/workspace-migration-agent-chat-channel-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateAgentChatChannelActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'agentChatChannel',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction({
    action,
    flatApplication,
    workspaceId,
  }: WorkspaceMigrationActionRunnerArgs<UniversalCreateAgentChatChannelAction>): Promise<FlatCreateAgentChatChannelAction> {
    const emptyUniversalForeignKeyAggregators =
      getUniversalFlatEntityEmptyForeignKeyAggregators({
        metadataName: 'agentChatChannel',
      });

    return {
      ...action,
      flatEntity: {
        ...action.flatEntity,
        applicationId: flatApplication.id,
        id: action.id ?? v4(),
        workspaceId,
        channelRoleIds: [],
        navigationMenuItemIds: [],
        ...emptyUniversalForeignKeyAggregators,
      },
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateAgentChatChannelAction>,
  ): Promise<void> {
    const { flatAction, queryRunner } = context;

    await this.insertFlatEntitiesInRepository({
      queryRunner,
      flatEntities: [flatAction.flatEntity],
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatCreateAgentChatChannelAction>,
  ): Promise<void> {
    return;
  }
}
