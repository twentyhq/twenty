import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/core-modules/common/exceptions/flat-entity-maps.exception';
import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { findFlatFieldMetadataInFlatObjectMetadataMapsWithOnlyFieldId } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-field-metadata-in-flat-object-metadata-maps-with-field-id-only.util';
import { findFlatObjectMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-in-flat-object-metadata-maps-or-throw.util';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { type CreateIndexAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-index-action-v2';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/get-workspace-schema-context-for-migration.util';
import { isDefined } from 'twenty-shared/utils';

@Injectable()
export class CreateIndexActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create_index',
) {
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {
    super();
  }

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
      flatIndexMetadata: { flatIndexFieldMetadatas, ...rest },
    } = action;

    await indexMetadataRepository.insert({
      indexFieldMetadatas: flatIndexFieldMetadatas,
      ...rest,
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

    const quotedColumns = flatIndexMetadata.flatIndexFieldMetadatas.map(
      ({ fieldMetadataId }) => {
        const flatFieldMetadata =
          findFlatFieldMetadataInFlatObjectMetadataMapsWithOnlyFieldId({
            fieldMetadataId,
            flatObjectMetadataMaps,
          });

        if (!isDefined(flatFieldMetadata)) {
          throw new FlatEntityMapsException(
            'Index field releated field metadata not found',
            FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
          );
        }

        return `"${flatFieldMetadata.name}"`;
      },
    );

    await this.workspaceSchemaManagerService.indexManager.createIndex({
      index: {
        columns: quotedColumns,
        name: flatIndexMetadata.name,
        isUnique: flatIndexMetadata.isUnique,
        type: flatIndexMetadata.indexType,
        where: flatIndexMetadata.indexWhereClause ?? undefined,
      },
      queryRunner,
      schemaName,
      tableName,
    });
  }
}
