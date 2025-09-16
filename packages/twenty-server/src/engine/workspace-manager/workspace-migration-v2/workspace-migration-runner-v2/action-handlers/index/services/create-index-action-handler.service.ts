import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { findFlatObjectMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-in-flat-object-metadata-maps-or-throw.util';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { type CreateIndexAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-index-action-v2';
import { computeIndexCreationQuery } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/index/utils/compute-index-creation-query.util';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/get-workspace-schema-context-for-migration.util';

@Injectable()
export class CreateIndexActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create_index',
) {
  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps: { flatIndexMaps },
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<CreateIndexAction>): Partial<AllFlatEntityMaps> {
    return {
      flatIndexMaps: addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: action.flatIndexMetadata,
        flatEntityMaps: flatIndexMaps,
      }),
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreateIndexAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const indexMetadataRepository =
      queryRunner.manager.getRepository<IndexMetadataEntity>(
        IndexMetadataEntity,
      );

    const {
      flatIndexMetadata: {
        createdAt,
        flatIndexFieldMetadatas,
        id,
        indexType,
        indexWhereClause,
        isCustom,
        isUnique,
        name,
        objectMetadataId,
        universalIdentifier,
      },
    } = action;

    await indexMetadataRepository.save({
      createdAt,
      indexFieldMetadatas: flatIndexFieldMetadatas.map(
        ({
          createdAt,
          fieldMetadataId,
          id,
          indexMetadataId,
          order,
          universalIdentifier,
          updatedAt,
        }) => ({
          createdAt,
          fieldMetadataId,
          id,
          indexMetadataId,
          order,
          universalIdentifier,
          updatedAt,
        }),
      ),
      id,
      indexType,
      indexWhereClause,
      isCustom,
      isUnique,
      name,
      objectMetadataId,
      universalIdentifier,
    });
  }

  async executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerArgs<CreateIndexAction>,
  ): Promise<void> {
    const {
      allFlatEntityMaps: { flatObjectMetadataMaps },
      action: { flatIndexMetadata },
      queryRunner,
      workspaceId,
    } = context;

    const flatObjectMetadata =
      findFlatObjectMetadataInFlatObjectMetadataMapsOrThrow({
        flatObjectMetadataMaps,
        objectMetadataId: flatIndexMetadata.objectMetadataId,
      });
    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      flatObjectMetadata,
    });
    const createIndexQuery = await computeIndexCreationQuery({
      flatIndexMetadata,
      flatObjectMetadataMaps,
      schemaName,
      tableName,
    });

    await queryRunner.query(createIndexQuery);
  }
}
