import { Injectable } from '@nestjs/common';

import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';
import {
  FlatUpdateAgentAction,
  UniversalUpdateAgentAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/agent/types/workspace-migration-agent-action-builder.service';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateAgentActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'agent',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdateAgentAction>,
  ): Promise<FlatUpdateAgentAction> {
    const { action, allFlatEntityMaps } = context;

    const flatAgent = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatAgentMaps,
      universalIdentifier: action.universalIdentifier,
    });

    const update = resolveUniversalUpdateRelationIdentifiersToIds({
      metadataName: 'agent',
      universalUpdate: action.update,
      allFlatEntityMaps,
    });

    return {
      type: 'update',
      metadataName: 'agent',
      entityId: flatAgent.id,
      update,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateAgentAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const agentRepository =
      queryRunner.manager.getRepository<AgentEntity>(AgentEntity);

    // Cast needed because TypeORM's QueryDeepPartialEntity doesn't handle
    // JsonbProperty branded types with nested Record<string, unknown> well
    await agentRepository.update(
      { id: entityId, workspaceId },
      update as QueryDeepPartialEntity<AgentEntity>,
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateAgentAction>,
  ): Promise<void> {
    return;
  }
}
