import { Injectable } from '@nestjs/common';

import { In } from 'typeorm';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { type DeleteFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/field/types/workspace-migration-field-action-v2';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/generate-column-definitions.util';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/get-workspace-schema-context-for-migration.util';
import {
  collectEnumOperationsForField,
  EnumOperation,
  executeBatchEnumOperations,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/workspace-schema-enum-operations.util';

@Injectable()
export class DeleteFieldActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'fieldMetadata',
) {
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteFieldAction>,
  ) {
    const { action, queryRunner } = context;
    const fieldMetadataRepository =
      queryRunner.manager.getRepository<FieldMetadataEntity>(
        FieldMetadataEntity,
      );

    const { entityId } = action;

    await fieldMetadataRepository.delete({
      id: In([entityId]),
    });
  }

  async executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerArgs<DeleteFieldAction>,
  ) {
    const {
      action,
      queryRunner,
      allFlatEntityMaps: { flatObjectMetadataMaps, flatFieldMetadataMaps },
      workspaceId,
    } = context;
    const { objectMetadataId, entityId } = action;

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: objectMetadataId,
    });

    const fieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityId: entityId,
    });

    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      flatObjectMetadata,
    });

    const columnDefinitions = generateColumnDefinitions({
      flatFieldMetadata: fieldMetadata,
      flatObjectMetadata: flatObjectMetadata,
    });
    const columnNamesToDrop = columnDefinitions.map((def) => def.name);

    await this.workspaceSchemaManagerService.columnManager.dropColumns({
      queryRunner,
      schemaName,
      tableName,
      columnNames: columnNamesToDrop,
      cascade: true,
    });

    const enumOperations = collectEnumOperationsForField({
      flatFieldMetadata: fieldMetadata,
      tableName,
      operation: EnumOperation.DROP,
    });

    await executeBatchEnumOperations({
      enumOperations,
      queryRunner,
      schemaName,
      workspaceSchemaManagerService: this.workspaceSchemaManagerService,
    });
  }
}
