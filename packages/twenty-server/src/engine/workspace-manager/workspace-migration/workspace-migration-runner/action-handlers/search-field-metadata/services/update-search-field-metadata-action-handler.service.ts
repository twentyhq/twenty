import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { SearchFieldMetadataEntity } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.entity';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';
import {
  FlatUpdateSearchFieldMetadataAction,
  UniversalUpdateSearchFieldMetadataAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/search-field-metadata/types/workspace-migration-search-field-metadata-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateSearchFieldMetadataActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'searchFieldMetadata',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdateSearchFieldMetadataAction>,
  ): Promise<FlatUpdateSearchFieldMetadataAction> {
    const { action, allFlatEntityMaps } = context;

    const flatSearchFieldMetadata = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatSearchFieldMetadataMaps,
      universalIdentifier: action.universalIdentifier,
    });

    const update = resolveUniversalUpdateRelationIdentifiersToIds({
      metadataName: 'searchFieldMetadata',
      universalUpdate: action.update,
      allFlatEntityMaps,
    });

    return {
      type: 'update',
      metadataName: 'searchFieldMetadata',
      entityId: flatSearchFieldMetadata.id,
      update,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateSearchFieldMetadataAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const searchFieldMetadataRepository =
      queryRunner.manager.getRepository<SearchFieldMetadataEntity>(
        SearchFieldMetadataEntity,
      );

    await searchFieldMetadataRepository.update(
      { id: entityId, workspaceId },
      update,
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateSearchFieldMetadataAction>,
  ): Promise<void> {
    return;
  }
}
