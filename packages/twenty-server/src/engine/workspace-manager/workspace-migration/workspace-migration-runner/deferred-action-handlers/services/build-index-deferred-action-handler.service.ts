import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';
import { createIndexInWorkspaceSchema } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/index/utils/index-action-handler.utils';
import { DeferredWorkspaceMigrationActionHandlerDecorator } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-action-handlers/decorators/deferred-workspace-migration-action-handler.decorator';
import { type DeferredWorkspaceMigrationActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-action-handlers/interfaces/deferred-workspace-migration-action-handler.interface';
import { type DeferredWorkspaceMigrationActionExecutionArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-migration-action-execution-args.type';
import { type DeferredWorkspaceMigrationActionPayload } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-migration-action.type';

@Injectable()
@DeferredWorkspaceMigrationActionHandlerDecorator('build_index')
export class BuildIndexDeferredActionHandlerService implements DeferredWorkspaceMigrationActionHandler<'build_index'> {
  readonly metadataNamesToLoad = ['index' as const];

  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {}

  async execute({
    workspaceId,
    payload: { indexMetadataId },
    allFlatEntityMaps: {
      flatIndexMaps,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    },
    attempt,
    queryRunner,
  }: DeferredWorkspaceMigrationActionExecutionArgs<
    DeferredWorkspaceMigrationActionPayload<'build_index'>
  >): Promise<void> {
    const flatIndexMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: flatIndexMaps,
      flatEntityId: indexMetadataId,
    });

    if (!isDefined(flatIndexMetadata)) {
      return;
    }

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: flatIndexMetadata.objectMetadataId,
    });

    if (attempt > 1) {
      const { schemaName } = getWorkspaceSchemaContextForMigration({
        workspaceId,
        objectMetadata: flatObjectMetadata,
      });

      await this.workspaceSchemaManagerService.indexManager.dropIndex({
        queryRunner,
        schemaName,
        indexName: flatIndexMetadata.name,
        concurrently: true,
      });
    }

    await createIndexInWorkspaceSchema({
      flatIndexMetadata,
      flatObjectMetadata,
      flatFieldMetadataMaps,
      workspaceSchemaManagerService: this.workspaceSchemaManagerService,
      queryRunner,
      workspaceId,
      concurrently: true,
    });
  }
}
