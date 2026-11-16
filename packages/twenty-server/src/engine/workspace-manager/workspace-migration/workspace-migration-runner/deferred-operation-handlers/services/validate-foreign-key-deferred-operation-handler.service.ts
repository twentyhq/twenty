import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { buildManyToOneForeignKeyDefinition } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/field/services/utils/build-many-to-one-foreign-key-definition.util';
import { DeferredWorkspaceOperationHandlerDecorator } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-operation-handlers/decorators/deferred-workspace-operation-handler.decorator';
import { type DeferredWorkspaceOperationHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-operation-handlers/interfaces/deferred-workspace-operation-handler.interface';
import { type DeferredWorkspaceOperationExecutionArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation-execution-args.type';
import { type DeferredWorkspaceOperationPayload } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation.type';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

@Injectable()
@DeferredWorkspaceOperationHandlerDecorator('validate_foreignKey')
export class ValidateForeignKeyDeferredOperationHandlerService implements DeferredWorkspaceOperationHandler<'validate_foreignKey'> {
  readonly metadataNamesToLoad = ['fieldMetadata' as const];

  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {}

  async execute({
    workspaceId,
    payload: { fieldMetadataId },
    allFlatEntityMaps: { flatFieldMetadataMaps, flatObjectMetadataMaps },
    queryRunner,
  }: DeferredWorkspaceOperationExecutionArgs<
    DeferredWorkspaceOperationPayload<'validate_foreignKey'>
  >): Promise<void> {
    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityId: fieldMetadataId,
    });

    if (
      !isDefined(flatFieldMetadata) ||
      !isMorphOrRelationFlatFieldMetadata(flatFieldMetadata)
    ) {
      return;
    }

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: flatFieldMetadata.objectMetadataId,
    });

    const flatTargetObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: flatFieldMetadata.relationTargetObjectMetadataId,
    });

    if (
      !isDefined(flatObjectMetadata) ||
      !isDefined(flatTargetObjectMetadata)
    ) {
      return;
    }

    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      objectMetadata: flatObjectMetadata,
    });

    await this.workspaceSchemaManagerService.foreignKeyManager.validateForeignKey(
      {
        queryRunner,
        schemaName,
        foreignKey: buildManyToOneForeignKeyDefinition({
          flatFieldMetadata,
          flatObjectMetadataMaps,
          tableName,
        }),
      },
    );
  }
}
