import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';
import {
  FlatUpdateConnectionProviderAction,
  UniversalUpdateConnectionProviderAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/connection-provider/types/workspace-migration-connection-provider-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateConnectionProviderActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'connectionProvider',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdateConnectionProviderAction>,
  ): Promise<FlatUpdateConnectionProviderAction> {
    const { action, allFlatEntityMaps } = context;

    const flatConnectionProvider = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatConnectionProviderMaps,
      universalIdentifier: action.universalIdentifier,
    });

    const update = resolveUniversalUpdateRelationIdentifiersToIds({
      metadataName: 'connectionProvider',
      universalUpdate: action.update,
      allFlatEntityMaps,
    });

    return {
      type: 'update',
      metadataName: 'connectionProvider',
      entityId: flatConnectionProvider.id,
      update,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateConnectionProviderAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const connectionProviderRepository =
      queryRunner.manager.getRepository<ConnectionProviderEntity>(
        ConnectionProviderEntity,
      );

    await connectionProviderRepository.update(
      { id: entityId, workspaceId },
      update,
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateConnectionProviderAction>,
  ): Promise<void> {
    return;
  }
}
