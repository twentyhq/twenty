import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { type WorkspaceMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-v2';
import { WorkspaceMigrationRunnerActionHandlerRegistryService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/registry/workspace-migration-runner-action-handler-registry.service';
import { applyWorkspaceMigrationActionOnFlatObjectMetadataMaps } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/apply-workspace-migration-action-on-flat-object-metadata-maps';

@Injectable()
export class WorkspaceMigrationRunnerV2Service {
  constructor(
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly workspaceMigrationRunnerActionHandlerRegistry: WorkspaceMigrationRunnerActionHandlerRegistryService,
  ) {}

  run = async (
    workspaceMigration: WorkspaceMigrationV2,
  ): Promise<FlatObjectMetadataMaps> => {
    const queryRunner = this.coreDataSource.createQueryRunner();

    const { flatObjectMetadataMaps: existingFlatObjectMetadataMaps } =
      await this.workspaceMetadataCacheService.getExistingOrRecomputeFlatObjectMetadataMaps(
        {
          workspaceId: workspaceMigration.workspaceId,
        },
      );

    await queryRunner.connect();
    await queryRunner.startTransaction();
    let optimisticFlatObjectMetadataMaps = structuredClone(
      existingFlatObjectMetadataMaps,
    );

    try {
      for (const action of workspaceMigration.actions) {
        await this.workspaceMigrationRunnerActionHandlerRegistry.executeActionHandler(
          action.type,
          {
            action,
            flatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
            queryRunner,
            workspaceId: workspaceMigration.workspaceId,
          },
        );

        optimisticFlatObjectMetadataMaps =
          applyWorkspaceMigrationActionOnFlatObjectMetadataMaps({
            action,
            flatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
            workspaceId: workspaceMigration.workspaceId,
          });
      }

      await queryRunner.commitTransaction();
      const { workspaceId } = workspaceMigration;

      await this.workspaceMetadataVersionService.incrementMetadataVersion(
        workspaceId,
      );

      await this.workspacePermissionsCacheService.recomputeRolesPermissionsCache(
        {
          workspaceId,
        },
      );

      return optimisticFlatObjectMetadataMaps;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  };
}
