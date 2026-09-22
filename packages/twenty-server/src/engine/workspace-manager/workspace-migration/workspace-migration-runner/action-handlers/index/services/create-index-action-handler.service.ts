import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import {
  type FlatCreateIndexAction,
  type UniversalCreateIndexAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/index/types/workspace-migration-index-action';
import { fromUniversalFlatIndexToFlatIndex } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/index/utils/from-universal-flat-index-to-flat-index.util';
import { createIndexInWorkspaceSchema } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/index/utils/index-action-handler.utils';
import { isIndexCreationDeferrable } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/index/utils/is-index-creation-deferrable.util';
import { type DeferredWorkspaceMigrationActionPayload } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-migration-action.type';
import { type DeferredWorkspaceMigrationActionExecutionArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-migration-action-execution-args.type';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';
import {
  type WorkspaceMigrationActionRunnerArgs,
  type WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateIndexActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'index',
) {
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalCreateIndexAction>,
  ): Promise<FlatCreateIndexAction> {
    const { action, allFlatEntityMaps, workspaceId, flatApplication } = context;

    const flatEntity = fromUniversalFlatIndexToFlatIndex({
      universalFlatIndexMetadata: action.flatEntity,
      indexMetadataId: action.id ?? v4(),
      allFlatEntityMaps,
      workspaceId,
      applicationId: flatApplication.id,
    });

    return {
      type: action.type,
      metadataName: action.metadataName,
      flatEntity,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateIndexAction>,
  ): Promise<void> {
    const { flatAction, queryRunner } = context;
    const { flatEntity: flatIndexMetadata } = flatAction;

    await this.insertFlatEntitiesInRepository({
      queryRunner,
      flatEntities: [flatIndexMetadata],
    });

    const indexFieldMetadataRepository = queryRunner.manager.getRepository(
      IndexFieldMetadataEntity,
    );

    await indexFieldMetadataRepository.insert(
      flatIndexMetadata.flatIndexFieldMetadatas,
    );
  }

  async executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateIndexAction>,
  ): Promise<void> {
    const {
      allFlatEntityMaps: { flatObjectMetadataMaps, flatFieldMetadataMaps },
      flatAction: { flatEntity: flatIndexMetadata },
      queryRunner,
      workspaceId,
    } = context;

    if (this.shouldDeferIndexCreation(context)) {
      return;
    }

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: flatIndexMetadata.objectMetadataId,
    });

    await createIndexInWorkspaceSchema({
      flatIndexMetadata,
      flatFieldMetadataMaps,
      flatObjectMetadata,
      workspaceSchemaManagerService: this.workspaceSchemaManagerService,
      queryRunner,
      workspaceId,
    });
  }

  protected override getDeferredAction(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateIndexAction>,
  ) {
    if (!this.shouldDeferIndexCreation(context)) {
      return undefined;
    }

    return {
      actionHandlerKey: 'create_index' as const,
      payload: { indexMetadataId: context.flatAction.flatEntity.id },
    };
  }

  override async executeDeferredAction({
    workspaceId,
    payload: { indexMetadataId },
    attempt,
    queryRunner,
  }: DeferredWorkspaceMigrationActionExecutionArgs<
    DeferredWorkspaceMigrationActionPayload<'create_index'>
  >): Promise<void> {
    const { flatIndexMetadata, flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.findIndexInWorkspaceCache({ workspaceId, indexMetadataId });

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

  private async findIndexInWorkspaceCache({
    workspaceId,
    indexMetadataId,
  }: {
    workspaceId: string;
    indexMetadataId: string;
  }): Promise<{
    flatIndexMetadata: FlatIndexMetadata | undefined;
    flatObjectMetadataMaps: MetadataFlatEntityMaps<'objectMetadata'>;
    flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
  }> {
    const indexCacheKeys = [
      'flatIndexMaps',
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
    ] as const;

    const cachedFlatEntityMaps =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        ...indexCacheKeys,
      ]);

    const hasIndexInCache = isDefined(
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityMaps: cachedFlatEntityMaps.flatIndexMaps,
        flatEntityId: indexMetadataId,
      }),
    );

    if (!hasIndexInCache) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        ...indexCacheKeys,
      ]);
    }

    const { flatIndexMaps, flatObjectMetadataMaps, flatFieldMetadataMaps } =
      hasIndexInCache
        ? cachedFlatEntityMaps
        : await this.workspaceCacheService.getOrRecompute(workspaceId, [
            ...indexCacheKeys,
          ]);

    return {
      flatIndexMetadata: findFlatEntityByIdInFlatEntityMaps({
        flatEntityMaps: flatIndexMaps,
        flatEntityId: indexMetadataId,
      }),
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    };
  }

  private shouldDeferIndexCreation({
    shouldDeferWorkspaceMigrationActions,
    allFlatEntityMaps: { flatFieldMetadataMaps },
    flatAction: { flatEntity: flatIndexMetadata },
  }: WorkspaceMigrationActionRunnerContext<FlatCreateIndexAction>): boolean {
    if (!shouldDeferWorkspaceMigrationActions) {
      return false;
    }

    return isIndexCreationDeferrable({
      flatIndexMetadata,
      indexedFlatFieldMetadatas: findManyFlatEntityByIdInFlatEntityMaps({
        flatEntityMaps: flatFieldMetadataMaps,
        flatEntityIds: flatIndexMetadata.flatIndexFieldMetadatas.map(
          (flatIndexFieldMetadata) => flatIndexFieldMetadata.fieldMetadataId,
        ),
      }),
    });
  }
}
