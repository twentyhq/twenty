import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import {
  WorkspaceQueryRunnerException,
  WorkspaceQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.exception';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/core-modules/common/exceptions/flat-entity-maps.exception';
import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { type CreateIndexAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-index-action-v2';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/get-workspace-schema-context-for-migration.util';

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
    const indexFieldMetadataRepository =
      queryRunner.manager.getRepository<IndexFieldMetadataEntity>(
        IndexFieldMetadataEntity,
      );

    const {
      flatIndexMetadata: { flatIndexFieldMetadatas, ...flatIndexMetadata },
    } = action;

    const indexInsertResult =
      await indexMetadataRepository.insert(flatIndexMetadata);

    if (indexInsertResult.identifiers.length !== 1) {
      throw new WorkspaceQueryRunnerException(
        'Failed to create index metadata',
        WorkspaceQueryRunnerExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }
    const indexMetadataId = indexInsertResult.identifiers[0].id;

    const indexFieldMetadataToInsert = flatIndexFieldMetadatas.map(
      (flatIndexFieldMetadata) => ({
        ...flatIndexFieldMetadata,
        indexMetadataId,
      }),
    );

    await indexFieldMetadataRepository.insert(indexFieldMetadataToInsert);
  }

  async executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerArgs<CreateIndexAction>,
  ): Promise<void> {
    const {
      allFlatEntityMaps: { flatObjectMetadataMaps, flatFieldMetadataMaps },
      action: { flatIndexMetadata },
      queryRunner,
      workspaceId,
    } = context;

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: flatIndexMetadata.objectMetadataId,
    });
    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      flatObjectMetadata,
    });

    const quotedColumns = flatIndexMetadata.flatIndexFieldMetadatas.map(
      ({ fieldMetadataId }) => {
        const flatFieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId: fieldMetadataId,
          flatEntityMaps: flatFieldMetadataMaps,
        });

        if (!isDefined(flatFieldMetadata)) {
          throw new FlatEntityMapsException(
            'Index field related field metadata not found',
            FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
          );
        }

        if (isMorphOrRelationFlatFieldMetadata(flatFieldMetadata)) {
          if (!isDefined(flatFieldMetadata.settings?.joinColumnName)) {
            throw new FlatEntityMapsException(
              'Join column name is not defined for relation field',
              FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
            );
          }

          return `"${flatFieldMetadata.settings.joinColumnName}"`;
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
