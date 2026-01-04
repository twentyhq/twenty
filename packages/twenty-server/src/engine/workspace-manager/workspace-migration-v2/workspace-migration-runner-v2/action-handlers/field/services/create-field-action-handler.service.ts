import { Injectable } from '@nestjs/common';

import { RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { convertOnDeleteActionToOnDelete } from 'src/engine/workspace-manager/workspace-migration-runner/utils/convert-on-delete-action-to-on-delete.util';
import { type CreateFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/field/types/workspace-migration-field-action-v2';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/generate-column-definitions.util';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/get-workspace-schema-context-for-migration.util';
import {
  collectEnumOperationsForField,
  EnumOperation,
  executeBatchEnumOperations,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/workspace-schema-enum-operations.util';

@Injectable()
export class CreateFieldActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'fieldMetadata',
) {
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreateFieldAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const fieldMetadataRepository =
      queryRunner.manager.getRepository<FieldMetadataEntity>(
        FieldMetadataEntity,
      );

    const { flatFieldMetadatas } = action;

    for (const flatFieldMetadata of flatFieldMetadatas) {
      await fieldMetadataRepository.insert(flatFieldMetadata);
    }
  }

  async executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerArgs<CreateFieldAction>,
  ): Promise<void> {
    const {
      action,
      queryRunner,
      allFlatEntityMaps: { flatObjectMetadataMaps },
      workspaceId,
    } = context;
    const { flatFieldMetadatas } = action;

    // TODO prastoin improve doing batchs
    for (const flatFieldMetadata of flatFieldMetadatas) {
      const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityMaps: flatObjectMetadataMaps,
        flatEntityId: flatFieldMetadata.objectMetadataId,
      });

      const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
        workspaceId,
        flatObjectMetadata,
      });

      const enumOperations = collectEnumOperationsForField({
        flatFieldMetadata,
        tableName,
        operation: EnumOperation.CREATE,
      });

      const columnDefinitions = generateColumnDefinitions({
        flatFieldMetadata,
        flatObjectMetadata,
      });

      await executeBatchEnumOperations({
        enumOperations,
        queryRunner,
        schemaName,
        workspaceSchemaManagerService: this.workspaceSchemaManagerService,
      });

      await this.workspaceSchemaManagerService.columnManager.addColumns({
        queryRunner,
        schemaName,
        tableName,
        columnDefinitions,
      });

      if (
        isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) &&
        flatFieldMetadata.settings.relationType === RelationType.MANY_TO_ONE
      ) {
        const targetFlatObjectMetadata =
          findFlatEntityByIdInFlatEntityMapsOrThrow({
            flatEntityId: flatFieldMetadata.relationTargetObjectMetadataId,
            flatEntityMaps: flatObjectMetadataMaps,
          });
        const referencedTableName = computeObjectTargetTable(
          targetFlatObjectMetadata,
        );

        const joinColumnName = flatFieldMetadata.settings.joinColumnName;

        if (!isDefined(joinColumnName)) {
          throw new Error(
            'Join column name is not defined in a MANY_TO_ONE relation',
          );
        }

        await this.workspaceSchemaManagerService.foreignKeyManager.createForeignKey(
          {
            queryRunner,
            schemaName,
            foreignKey: {
              tableName,
              columnName: joinColumnName,
              referencedTableName,
              referencedColumnName: 'id',
              onDelete:
                convertOnDeleteActionToOnDelete(
                  flatFieldMetadata.settings.onDelete,
                ) ?? 'CASCADE',
            },
          },
        );
      }
    }
  }
}
