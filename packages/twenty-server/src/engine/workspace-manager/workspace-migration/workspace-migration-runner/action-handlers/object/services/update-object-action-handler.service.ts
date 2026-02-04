import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { isCompositeFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-composite-flat-field-metadata.util';
import { isEnumFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import {
  type FlatUpdateObjectAction,
  type UniversalUpdateObjectAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/object/types/workspace-migration-object-action';
import {
  type WorkspaceMigrationActionRunnerArgs,
  type WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';
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

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdateObjectAction>,
  ): Promise<FlatUpdateObjectAction> {
    const { action, allFlatEntityMaps } = context;

    const flatObjectMetadata = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatObjectMetadataMaps,
      universalIdentifier: action.universalIdentifier,
    });

    // TODO: transpile updates universal identifiers when builder has been migrated
    // For now, updates only contain flat entity diff properties (already IDs, not universal identifiers)

    return {
      type: 'update',
      metadataName: 'objectMetadata',
      entityId: flatObjectMetadata.id,
      update: action.update,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateObjectAction>,
  ): Promise<void> {
    const { flatAction, queryRunner } = context;

    const objectMetadataRepository =
      queryRunner.manager.getRepository<ObjectMetadataEntity>(
        ObjectMetadataEntity,
      );

    await objectMetadataRepository.update(
      flatAction.entityId,
      flatAction.update,
    );
  }

  async executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateObjectAction>,
  ): Promise<void> {
    const {
      flatAction,
      queryRunner,
      allFlatEntityMaps: { flatObjectMetadataMaps, flatFieldMetadataMaps },
      workspaceId,
    } = context;
    const { entityId, update } = flatAction;

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: entityId,
    });

    const { schemaName, tableName: currentTableName } =
      getWorkspaceSchemaContextForMigration({
        workspaceId,
        objectMetadata: flatObjectMetadata,
      });

    if (isDefined(update.nameSingular)) {
      const updatedFlatObjectMetadata: FlatObjectMetadata = {
        ...flatObjectMetadata,
        nameSingular: update.nameSingular,
      };

      const newTableName = computeObjectTargetTable(updatedFlatObjectMetadata);

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
            flatEntityIds: updatedFlatObjectMetadata.fieldIds,
          });

        const enumOrCompositeFlatFieldMetadatas =
          objectFlatFieldMetadatas.filter(
            (flatFieldMetadata) =>
              isEnumFlatFieldMetadata(flatFieldMetadata) ||
              isCompositeFlatFieldMetadata(flatFieldMetadata),
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
