import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { EventMetadataEntity } from 'src/engine/metadata-modules/event-metadata/entities/event-metadata.entity';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';
import {
  FlatUpdateEventMetadataAction,
  UniversalUpdateEventMetadataAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/event-metadata/types/workspace-migration-event-metadata-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateEventMetadataActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'eventMetadata',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdateEventMetadataAction>,
  ): Promise<FlatUpdateEventMetadataAction> {
    const { action, allFlatEntityMaps } = context;

    const flatEventMetadata = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatEventMetadataMaps,
      universalIdentifier: action.universalIdentifier,
    });

    const update = resolveUniversalUpdateRelationIdentifiersToIds({
      metadataName: 'eventMetadata',
      universalUpdate: action.update,
      allFlatEntityMaps,
    });

    return {
      type: 'update',
      metadataName: 'eventMetadata',
      entityId: flatEventMetadata.id,
      update,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateEventMetadataAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const eventMetadataRepository =
      queryRunner.manager.getRepository<EventMetadataEntity>(
        EventMetadataEntity,
      );

    await eventMetadataRepository.update({ id: entityId, workspaceId }, update);
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateEventMetadataAction>,
  ): Promise<void> {
    return;
  }
}
