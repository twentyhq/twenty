import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { isCompositeFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-composite-flat-field-metadata.util';
import { isEnumFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { findFlatEntityPropertyUpdate } from 'src/engine/workspace-manager/workspace-migration/utils/find-flat-entity-property-update.util';
import { type UpdateObjectAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/object/types/workspace-migration-object-action';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/from-flat-entity-properties-updates-to-partial-flat-entity';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';
import {
  collectEnumOperationsForObject,
  EnumOperation,
  executeBatchEnumOperations,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/workspace-schema-enum-operations.util';

@Injectable()
export class UpdateObjectActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'objectMetadata',
) {
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {
    super();
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
      action.entityId,
      fromFlatEntityPropertiesUpdatesToPartialFlatEntity(action),
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
    const { entityId, updates } = action;

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: entityId,
    });

    const { schemaName, tableName: currentTableName } =
      getWorkspaceSchemaContextForMigration({
        workspaceId,
        flatObjectMetadata: flatObjectMetadata,
      });

    const nameSingularUpdate = findFlatEntityPropertyUpdate({
      flatEntityUpdates: updates,
      property: 'nameSingular',
    });

    if (isDefined(nameSingularUpdate)) {
      const updatedObjectMetadata: FlatObjectMetadata = {
        ...flatObjectMetadata,
        nameSingular: nameSingularUpdate.to,
      };

      const newTableName = computeObjectTargetTable(updatedObjectMetadata);

      if (currentTableName !== newTableName) {
        await this.workspaceSchemaManagerService.tableManager.renameTable({
          queryRunner,
          schemaName,
          oldTableName: currentTableName,
          newTableName,
        });

        const objectFlatFieldMetadatas =
          findManyFlatEntityByIdInFlatEntityMapsOrThrow({
            flatEntityMaps: flatFieldMetadataMaps,
            flatEntityIds: updatedObjectMetadata.fieldIds,
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
