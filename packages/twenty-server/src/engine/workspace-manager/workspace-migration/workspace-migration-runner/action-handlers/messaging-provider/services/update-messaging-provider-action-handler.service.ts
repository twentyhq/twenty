import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { MessagingProviderEntity } from 'src/engine/metadata-modules/messaging-provider/entities/messaging-provider.entity';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';
import {
  FlatUpdateMessagingProviderAction,
  UniversalUpdateMessagingProviderAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/messaging-provider/types/workspace-migration-messaging-provider-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateMessagingProviderActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'messagingProvider',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdateMessagingProviderAction>,
  ): Promise<FlatUpdateMessagingProviderAction> {
    const { action, allFlatEntityMaps } = context;

    const flatMessagingProvider = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatMessagingProviderMaps,
      universalIdentifier: action.universalIdentifier,
    });

    const update = resolveUniversalUpdateRelationIdentifiersToIds({
      metadataName: 'messagingProvider',
      universalUpdate: action.update,
      allFlatEntityMaps,
    });

    return {
      type: 'update',
      metadataName: 'messagingProvider',
      entityId: flatMessagingProvider.id,
      update,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateMessagingProviderAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const messagingProviderRepository =
      queryRunner.manager.getRepository<MessagingProviderEntity>(
        MessagingProviderEntity,
      );

    await messagingProviderRepository.update(
      { id: entityId, workspaceId },
      update,
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateMessagingProviderAction>,
  ): Promise<void> {
    return;
  }
}
