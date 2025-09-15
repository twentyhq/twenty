import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { OptimisticallyApplyActionOnAllFlatEntityMapsArgs, WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { findFlatObjectMetadataInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-in-flat-object-metadata-maps.util';
import { replaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/replace-flat-object-metadata-in-flat-object-metadata-maps-or-throw.util';
import { WorkspaceMigrationRunnerException, WorkspaceMigrationRunnerExceptionCode } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/exceptions/workspace-migration-runner.exception';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isCompositeFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-composite-flat-field-metadata.util';
import { isEnumFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { findFlatObjectMetadataWithFlatFieldMapsInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-with-flat-field-maps-in-flat-object-metadata-maps-or-throw.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { type UpdateObjectAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromWorkspaceMigrationUpdateActionToPartialEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-workspace-migration-update-action-to-partial-field-or-object-entity.util';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/get-workspace-schema-context-for-migration.util';
import {
    collectEnumOperationsForObject,
    EnumOperation,
    executeBatchEnumOperations,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/workspace-schema-enum-operations.util';

@Injectable()
export class UpdateObjectActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update_object',
) {
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {
    super();
  }

  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<UpdateObjectAction>): AllFlatEntityMaps {
    const { flatObjectMetadataMaps } = allFlatEntityMaps;
    const { objectMetadataId } = action;

    const existingFlatObjectMetadata = findFlatObjectMetadataInFlatObjectMetadataMaps({
      objectMetadataId,
      flatObjectMetadataMaps,
    });

    if (!isDefined(existingFlatObjectMetadata)) {
      throw new WorkspaceMigrationRunnerException(
        `Workspace migration failed: Object metadata not found in cache`,
        WorkspaceMigrationRunnerExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    const updatedFlatObjectMetadata = {
      ...existingFlatObjectMetadata,
      ...fromWorkspaceMigrationUpdateActionToPartialEntity(action),
    };

    const updatedFlatObjectMetadataMaps = replaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrow({
      flatObjectMetadata: updatedFlatObjectMetadata,
      flatObjectMetadataMaps,
    });

    return {
      ...allFlatEntityMaps,
      flatObjectMetadataMaps: updatedFlatObjectMetadataMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdateObjectAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;

    const objectMetadataRepository =
      queryRunner.manager.getRepository<ObjectMetadataEntity>(
        ObjectMetadataEntity,
      );

    await objectMetadataRepository.update(
      action.objectMetadataId,
      fromWorkspaceMigrationUpdateActionToPartialEntity(action),
    );
  }

  async executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerArgs<UpdateObjectAction>,
  ): Promise<void> {
    const { action, queryRunner, allFlatEntityMaps: {flatObjectMetadataMaps}, workspaceId } =
      context;
    const { objectMetadataId, updates } = action;

    const flatObjectMetadataWithFlatFieldMaps =
      findFlatObjectMetadataWithFlatFieldMapsInFlatObjectMetadataMapsOrThrow({
        flatObjectMetadataMaps,
        objectMetadataId,
      });

    const { schemaName, tableName: currentTableName } =
      getWorkspaceSchemaContextForMigration({
        workspaceId,
        flatObjectMetadata: flatObjectMetadataWithFlatFieldMaps,
      });

    for (const update of updates) {
      if (update.property !== 'nameSingular') {
        continue;
      }

      const updatedObjectMetadata = {
        ...flatObjectMetadataWithFlatFieldMaps,
        [update.property]: update.to,
      };

      const newTableName = computeObjectTargetTable(updatedObjectMetadata);

      if (currentTableName !== newTableName) {
        await this.workspaceSchemaManagerService.tableManager.renameTable({
          queryRunner,
          schemaName,
          oldTableName: currentTableName,
          newTableName,
        });

        const enumOrCompositeFlatFieldMetadatas = Object.values(
          flatObjectMetadataWithFlatFieldMaps.fieldsById,
        )
          .filter((field): field is FlatFieldMetadata => field != null)
          .filter(
            (field) =>
              isEnumFlatFieldMetadata(field) ||
              isCompositeFlatFieldMetadata(field),
          );

        const enumOperations = collectEnumOperationsForObject({
          flatFieldMetadatas: enumOrCompositeFlatFieldMetadatas,
          tableName: currentTableName,
          operation: EnumOperation.RENAME,
          options: {
            newTableName,
          },
        });

        await executeBatchEnumOperations({
          enumOperations,
          queryRunner,
          schemaName,
          workspaceSchemaManagerService: this.workspaceSchemaManagerService,
        });
      }
    }
  }
}
