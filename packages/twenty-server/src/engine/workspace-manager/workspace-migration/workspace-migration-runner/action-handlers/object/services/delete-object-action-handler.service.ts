import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findManyFlatEntityByUniversalIdentifiersOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-universal-identifiers-or-throw.util';
import { isCompositeUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-composite-flat-field-metadata.util';
import { isEnumUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { type FlatDeleteObjectAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/object/types/workspace-migration-object-action';
import { type WorkspaceMigrationActionRunnerContext } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';
import {
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
  ) {
    super();
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
    } = context;

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: flatAction.entityId,
    });

    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      objectMetadata: flatObjectMetadata,
    });

    await this.workspaceSchemaManagerService.tableManager.dropTable({
      queryRunner,
      schemaName,
      tableName,
      cascade: true,
    });
    const objectFlatFieldMetadatas =
      findManyFlatEntityByUniversalIdentifiersOrThrow({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifiers: flatObjectMetadata.fieldUniversalIdentifiers,
      });
    const enumOrCompositeFlatFieldMetadatas = objectFlatFieldMetadatas.filter(
      (field) =>
        isEnumUniversalFlatFieldMetadata(field) ||
        isCompositeUniversalFlatFieldMetadata(field),
    );

    const enumOperations = collectEnumOperationsForObject({
      universalFlatFieldMetadatas: enumOrCompositeFlatFieldMetadatas,
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
