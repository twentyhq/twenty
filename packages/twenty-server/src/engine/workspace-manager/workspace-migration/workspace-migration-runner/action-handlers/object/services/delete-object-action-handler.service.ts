import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { PendingMetadataDropService } from 'src/engine/core-modules/metadata-removal-retention/pending-metadata-drop.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { isCompositeFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-composite-flat-field-metadata.util';
import { isEnumFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/generate-column-definitions.util';
import {
  type FlatDeleteObjectAction,
  type UniversalDeleteObjectAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/object/types/workspace-migration-object-action';
import {
  type WorkspaceMigrationActionRunnerArgs,
  type WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';
import {
  collectEnumNamesFromDropOperations,
  collectEnumOperationsForObject,
  EnumOperation,
  executeBatchEnumOperations,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/workspace-schema-enum-operations.util';

@Injectable()
export class DeleteObjectActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'objectMetadata',
) {
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
    private readonly pendingMetadataDropService: PendingMetadataDropService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteObjectAction>,
  ): Promise<FlatDeleteObjectAction> {
    const { action, allFlatEntityMaps } = context;

    const flatObjectMetadata = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatObjectMetadataMaps,
      universalIdentifier: action.universalIdentifier,
    });

    return {
      type: 'delete',
      metadataName: 'objectMetadata',
      entityId: flatObjectMetadata.id,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteObjectAction>,
  ): Promise<void> {
    const { flatAction, queryRunner } = context;

    const objectMetadataRepository =
      queryRunner.manager.getRepository<ObjectMetadataEntity>(
        ObjectMetadataEntity,
      );

    await objectMetadataRepository.delete(flatAction.entityId);
  }

  async executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteObjectAction>,
  ): Promise<void> {
    const {
      flatAction,
      queryRunner,
      allFlatEntityMaps: { flatObjectMetadataMaps, flatFieldMetadataMaps },
      workspaceId,
      flatApplication,
    } = context;

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: flatAction.entityId,
    });

    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      objectMetadata: flatObjectMetadata,
    });

    const objectFlatFieldMetadatas =
      findManyFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityMaps: flatFieldMetadataMaps,
        flatEntityIds: flatObjectMetadata.fieldIds,
      });

    const columnDefinitions = objectFlatFieldMetadatas.flatMap(
      (flatFieldMetadata) =>
        generateColumnDefinitions({
          flatFieldMetadata,
          flatObjectMetadata,
          workspaceId,
        }),
    );

    const enumOrCompositeFlatFieldMetadatas = objectFlatFieldMetadatas.filter(
      (flatFieldMetadata) =>
        isEnumFlatFieldMetadata(flatFieldMetadata) ||
        isCompositeFlatFieldMetadata(flatFieldMetadata),
    );

    const enumOperations = collectEnumOperationsForObject({
      flatFieldMetadatas: enumOrCompositeFlatFieldMetadatas,
      tableName,
      operation: EnumOperation.DROP,
    });

    const retentionDays = this.twentyConfigService.get(
      'METADATA_REMOVAL_RETENTION_DAYS',
    );

    if (retentionDays > 0) {
      await this.pendingMetadataDropService.recordTableDrop({
        queryRunner,
        workspaceId,
        applicationId: flatApplication.id,
        schemaName,
        tableName,
        enumNames: collectEnumNamesFromDropOperations(enumOperations),
        columnDefinitions,
        retentionDays,
      });

      return;
    }

    await this.workspaceSchemaManagerService.tableManager.dropTable({
      queryRunner,
      schemaName,
      tableName,
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
