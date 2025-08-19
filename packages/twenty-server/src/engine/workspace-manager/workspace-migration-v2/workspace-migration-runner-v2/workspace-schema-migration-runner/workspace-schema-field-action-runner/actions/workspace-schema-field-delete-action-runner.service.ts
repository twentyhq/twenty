import { Injectable } from '@nestjs/common';

import { findFlatObjectMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-in-flat-object-metadata-maps-or-throw.util';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { DeleteFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/utils/generate-column-definitions.util';
import { prepareFieldWorkspaceSchemaContext } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/utils/workspace-schema-context.util';
import {
  collectEnumOperationsForField,
  EnumOperation,
  executeBatchEnumOperations,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/utils/workspace-schema-enum-operations.util';

@Injectable()
export class WorkspaceSchemaFieldDeleteActionRunnerService {
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {}

  public async run({
    action,
    queryRunner,
    flatObjectMetadataMaps,
  }: WorkspaceMigrationActionRunnerArgs<DeleteFieldAction>): Promise<void> {
    const { objectMetadataId, fieldMetadataId } = action;
    const { schemaName, tableName, fieldMetadata } =
      prepareFieldWorkspaceSchemaContext({
        flatObjectMetadataMaps,
        objectMetadataId,
        fieldMetadataId,
      });

    const flatObjectMetadata =
      findFlatObjectMetadataInFlatObjectMetadataMapsOrThrow({
        flatObjectMetadataMaps,
        objectMetadataId,
      });

    const columnDefinitions = generateColumnDefinitions({
      flatFieldMetadata: fieldMetadata,
      flatObjectMetadataWithoutFields: flatObjectMetadata,
    });
    const columnNamesToDrop = columnDefinitions.map((def) => def.name);

    await this.workspaceSchemaManagerService.columnManager.dropColumns({
      queryRunner,
      schemaName,
      tableName,
      columnNames: columnNamesToDrop,
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

    return;
  }
}
