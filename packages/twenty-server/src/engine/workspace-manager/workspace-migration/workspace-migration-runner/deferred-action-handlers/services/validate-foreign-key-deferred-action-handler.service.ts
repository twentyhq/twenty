import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { buildManyToOneForeignKeyDefinition } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/field/services/utils/build-many-to-one-foreign-key-definition.util';
import { DeferredWorkspaceMigrationActionHandlerDecorator } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-action-handlers/decorators/deferred-workspace-migration-action-handler.decorator';
import { type DeferredWorkspaceMigrationActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-action-handlers/interfaces/deferred-workspace-migration-action-handler.interface';
import { type DeferredWorkspaceMigrationActionExecutionArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-migration-action-execution-args.type';
import { type DeferredWorkspaceMigrationActionPayload } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-migration-action.type';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

@Injectable()
@DeferredWorkspaceMigrationActionHandlerDecorator('validate_foreignKey')
export class ValidateForeignKeyDeferredActionHandlerService implements DeferredWorkspaceMigrationActionHandler<'validate_foreignKey'> {
  readonly metadataNamesToLoad = ['fieldMetadata' as const];

  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {}

  async execute({
    workspaceId,
    payload: { fieldMetadataId },
    allFlatEntityMaps: { flatFieldMetadataMaps, flatObjectMetadataMaps },
    queryRunner,
  }: DeferredWorkspaceMigrationActionExecutionArgs<
    DeferredWorkspaceMigrationActionPayload<'validate_foreignKey'>
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

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: flatFieldMetadata.objectMetadataId,
    });

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
