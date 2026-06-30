import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { PendingMetadataDropService } from 'src/engine/core-modules/metadata-removal-retention/pending-metadata-drop.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import {
  type FlatDeleteFieldAction,
  type UniversalDeleteFieldAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action';
import {
  type WorkspaceMigrationActionRunnerArgs,
  type WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/generate-column-definitions.util';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';
import {
  collectEnumNamesFromDropOperations,
  collectEnumOperationsForField,
  EnumOperation,
  executeBatchEnumOperations,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/workspace-schema-enum-operations.util';

@Injectable()
export class DeleteFieldActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'fieldMetadata',
) {
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
    private readonly pendingMetadataDropService: PendingMetadataDropService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteFieldAction>,
  ): Promise<FlatDeleteFieldAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteFieldAction>,
  ) {
    const { flatAction, queryRunner, workspaceId } = context;

    const fieldMetadataRepository =
      queryRunner.manager.getRepository<FieldMetadataEntity>(
        FieldMetadataEntity,
      );

    await fieldMetadataRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteFieldAction>,
  ) {
    const {
      flatAction,
      queryRunner,
      allFlatEntityMaps: { flatObjectMetadataMaps, flatFieldMetadataMaps },
      workspaceId,
      flatApplication,
    } = context;

    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityId: flatAction.entityId,
    });

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: flatFieldMetadata.objectMetadataId,
    });

    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      objectMetadata: flatObjectMetadata,
    });

    const columnDefinitions = generateColumnDefinitions({
      flatFieldMetadata,
      flatObjectMetadata,
      workspaceId,
    });
    const columnNamesToDrop = columnDefinitions.map((def) => def.name);

    const enumOperations = collectEnumOperationsForField({
      flatFieldMetadata,
      tableName,
      operation: EnumOperation.DROP,
    });

    const retentionDays = this.twentyConfigService.get(
      'METADATA_REMOVAL_RETENTION_DAYS',
    );

    if (retentionDays > 0) {
      await this.pendingMetadataDropService.recordColumnDrop({
        queryRunner,
        workspaceId,
        applicationId: flatApplication.id,
        schemaName,
        tableName,
        columnNames: columnNamesToDrop,
        enumNames: collectEnumNamesFromDropOperations(enumOperations),
        columnDefinitions,
        retentionDays,
      });

      return;
    }

    await this.workspaceSchemaManagerService.columnManager.dropColumns({
      queryRunner,
      schemaName,
      tableName,
      columnNames: columnNamesToDrop,
      cascade: true,
    });

    await executeBatchEnumOperations({
      enumOperations,
      queryRunner,
      schemaName,
      workspaceSchemaManagerService: this.workspaceSchemaManagerService,
    });
  }
}
