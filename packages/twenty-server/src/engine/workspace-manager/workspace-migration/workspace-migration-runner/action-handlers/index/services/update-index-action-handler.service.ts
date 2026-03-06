import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import {
  type FlatUpdateIndexAction,
  type UniversalUpdateIndexAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/index/types/workspace-migration-index-action';
import { fromUniversalFlatIndexToFlatIndex } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/index/utils/from-universal-flat-index-to-flat-index.util';
import {
  createIndexInWorkspaceSchema,
  deleteIndexMetadata,
  dropIndexFromWorkspaceSchema,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/index/utils/index-action-handler.utils';
import {
  type WorkspaceMigrationActionRunnerArgs,
  type WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateIndexActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'index',
) {
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdateIndexAction>,
  ): Promise<FlatUpdateIndexAction> {
    const { action, allFlatEntityMaps, workspaceId, flatApplication } = context;

    const flatIndexMetadata = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatIndexMaps,
      universalIdentifier: action.universalIdentifier,
    });

    const updatedFlatIndex = fromUniversalFlatIndexToFlatIndex({
      universalFlatIndexMetadata: action.updatedUniversalFlatIndex,
      indexMetadataId: v4(),
      allFlatEntityMaps,
      workspaceId,
      applicationId: flatApplication.id,
    });

    return {
      type: action.type,
      metadataName: action.metadataName,
      entityId: flatIndexMetadata.id,
      update: {},
      updatedFlatIndex,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateIndexAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { updatedFlatIndex } = flatAction;

    await deleteIndexMetadata({
      entityId: flatAction.entityId,
      queryRunner,
      workspaceId,
    });

    await this.insertFlatEntitiesInRepository({
      queryRunner,
      flatEntities: [updatedFlatIndex],
    });

    const indexFieldMetadataRepository = queryRunner.manager.getRepository(
      IndexFieldMetadataEntity,
    );

    const indexFieldMetadataToInsert =
      updatedFlatIndex.flatIndexFieldMetadatas.map(
        (flatIndexFieldMetadata) => ({
          ...flatIndexFieldMetadata,
          indexMetadataId: updatedFlatIndex.id,
        }),
      );

    await indexFieldMetadataRepository.insert(indexFieldMetadataToInsert);
  }

  async executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateIndexAction>,
  ): Promise<void> {
    const {
      flatAction,
      allFlatEntityMaps: {
        flatIndexMaps,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      },
      queryRunner,
      workspaceId,
    } = context;

    const { entityId, updatedFlatIndex } = flatAction;

    // Get the old index to drop it
    const flatIndexMetadataToDelete = findFlatEntityByIdInFlatEntityMapsOrThrow(
      {
        flatEntityId: entityId,
        flatEntityMaps: flatIndexMaps,
      },
    );

    const schemaName = getWorkspaceSchemaName(workspaceId);

    // Drop old index
    await dropIndexFromWorkspaceSchema({
      indexName: flatIndexMetadataToDelete.name,
      workspaceSchemaManagerService: this.workspaceSchemaManagerService,
      queryRunner,
      schemaName,
    });

    // Create new index
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: updatedFlatIndex.objectMetadataId,
    });

    await createIndexInWorkspaceSchema({
      flatIndexMetadata: updatedFlatIndex,
      flatObjectMetadata,
      flatFieldMetadataMaps,
      workspaceSchemaManagerService: this.workspaceSchemaManagerService,
      queryRunner,
      workspaceId,
    });
  }
}
