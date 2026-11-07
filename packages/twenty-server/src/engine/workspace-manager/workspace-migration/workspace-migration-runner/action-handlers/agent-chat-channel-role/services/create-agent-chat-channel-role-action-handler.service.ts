import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { getUniversalFlatEntityEmptyForeignKeyAggregators } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/reset-universal-flat-entity-foreign-key-aggregators.util';
import { resolveUniversalRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-relation-identifiers-to-ids.util';
import {
  FlatCreateAgentChatChannelRoleAction,
  UniversalCreateAgentChatChannelRoleAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/agent-chat-channel-role/types/workspace-migration-agent-chat-channel-role-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateAgentChatChannelRoleActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'agentChatChannelRole',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction({
    action,
    allFlatEntityMaps,
    flatApplication,
    workspaceId,
  }: WorkspaceMigrationActionRunnerArgs<UniversalCreateAgentChatChannelRoleAction>): Promise<FlatCreateAgentChatChannelRoleAction> {
    const { channelId, roleId } = resolveUniversalRelationIdentifiersToIds({
      flatEntityMaps: allFlatEntityMaps,
      metadataName: action.metadataName,
      universalForeignKeyValues: action.flatEntity,
    });

    const emptyUniversalForeignKeyAggregators =
      getUniversalFlatEntityEmptyForeignKeyAggregators({
        metadataName: 'agentChatChannelRole',
      });

    return {
      ...action,
      flatEntity: {
        ...action.flatEntity,
        channelId,
        roleId,
        applicationId: flatApplication.id,
        id: action.id ?? v4(),
        workspaceId,
        ...emptyUniversalForeignKeyAggregators,
      },
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateAgentChatChannelRoleAction>,
  ): Promise<void> {
    const { flatAction, queryRunner } = context;

    await this.insertFlatEntitiesInRepository({
      queryRunner,
      flatEntities: [flatAction.flatEntity],
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatCreateAgentChatChannelRoleAction>,
  ): Promise<void> {
    return;
  }
}
