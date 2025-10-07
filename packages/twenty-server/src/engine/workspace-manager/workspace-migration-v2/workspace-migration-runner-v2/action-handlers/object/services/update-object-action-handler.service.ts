import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { findObjectFlatFieldMetadatasOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-object-fields-in-flat-field-metadata-maps-or-throw.util';
import { isCompositeFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-composite-flat-field-metadata.util';
import { isEnumFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
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
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<UpdateObjectAction>): Partial<AllFlatEntityMaps> {
    const { flatObjectMetadataMaps } = allFlatEntityMaps;
    const { objectMetadataId } = action;

    const existingFlatObjectMetadata =
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: objectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

    const updatedFlatObjectMetadata = {
      ...existingFlatObjectMetadata,
      ...fromWorkspaceMigrationUpdateActionToPartialEntity(action),
    };

    const updatedFlatObjectMetadataMaps =
      replaceFlatEntityInFlatEntityMapsOrThrow({
        flatEntity: updatedFlatObjectMetadata,
        flatEntityMaps: flatObjectMetadataMaps,
      });

    return {
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
    const {
      action,
      queryRunner,
      allFlatEntityMaps: { flatObjectMetadataMaps, flatFieldMetadataMaps },
      workspaceId,
    } = context;
    const { objectMetadataId, updates } = action;

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: objectMetadataId,
    });

    const { schemaName, tableName: currentTableName } =
      getWorkspaceSchemaContextForMigration({
        workspaceId,
        flatObjectMetadata: flatObjectMetadata,
      });

    for (const update of updates) {
      if (update.property !== 'nameSingular') {
        continue;
      }

      const updatedObjectMetadata = {
        ...flatObjectMetadata,
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

        const { objectFlatFieldMetadatas } =
          findObjectFlatFieldMetadatasOrThrow({
            flatFieldMetadataMaps,
            flatObjectMetadata: updatedObjectMetadata,
          });
        const enumOrCompositeFlatFieldMetadatas =
          objectFlatFieldMetadatas.filter(
            (flatField) =>
              isEnumFlatFieldMetadata(flatField) ||
              isCompositeFlatFieldMetadata(flatField),
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
