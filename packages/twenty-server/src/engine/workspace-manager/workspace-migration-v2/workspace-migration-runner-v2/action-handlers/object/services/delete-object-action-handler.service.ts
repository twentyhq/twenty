import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { isCompositeFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-composite-flat-field-metadata.util';
import { isEnumFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { type DeleteObjectAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/get-workspace-schema-context-for-migration.util';
import {
  collectEnumOperationsForObject,
  EnumOperation,
  executeBatchEnumOperations,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/workspace-schema-enum-operations.util';

@Injectable()
export class DeleteObjectActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete_object',
) {
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {
    super();
  }

  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<DeleteObjectAction>): Partial<AllFlatEntityMaps> {
    const { flatObjectMetadataMaps } = allFlatEntityMaps;
    const { objectMetadataId } = action;

    const updatedFlatObjectMetadataMaps =
      deleteFlatEntityFromFlatEntityMapsOrThrow({
        flatEntityMaps: flatObjectMetadataMaps,
        entityToDeleteId: objectMetadataId,
      });

    return {
      flatObjectMetadataMaps: updatedFlatObjectMetadataMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteObjectAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const { objectMetadataId } = action;

    const objectMetadataRepository =
      queryRunner.manager.getRepository<ObjectMetadataEntity>(
        ObjectMetadataEntity,
      );

    await objectMetadataRepository.delete(objectMetadataId);
  }

  async executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerArgs<DeleteObjectAction>,
  ): Promise<void> {
    const {
      action,
      queryRunner,
      allFlatEntityMaps: { flatObjectMetadataMaps, flatFieldMetadataMaps },
      workspaceId,
    } = context;
    const { objectMetadataId } = action;

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: objectMetadataId,
    });

    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      flatObjectMetadata,
    });

    await this.workspaceSchemaManagerService.tableManager.dropTable({
      queryRunner,
      schemaName,
      tableName,
    });
    const objectFlatFieldMetadatas =
      findManyFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityMaps: flatFieldMetadataMaps,
        flatEntityIds: flatObjectMetadata.fieldMetadataIds,
      });
    const enumOrCompositeFlatFieldMetadatas = objectFlatFieldMetadatas.filter(
      (field) =>
        isEnumFlatFieldMetadata(field) || isCompositeFlatFieldMetadata(field),
    );

    const enumOperations = collectEnumOperationsForObject({
      flatFieldMetadatas: enumOrCompositeFlatFieldMetadatas,
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
