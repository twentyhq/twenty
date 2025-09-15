import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { FlatEntityMapsCacheService } from 'src/engine/core-modules/common/services/flat-entity-maps-cache.service';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
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
    private readonly flatEntityMapsCacheService: FlatEntityMapsCacheService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly workspaceMigrationRunnerActionHandlerRegistry: WorkspaceMigrationRunnerActionHandlerRegistryService,
  ) {}

  run = async ({
    actions,
    workspaceId,
  }: WorkspaceMigrationV2): Promise<FlatObjectMetadataMaps> => {
    const queryRunner = this.coreDataSource.createQueryRunner();

    const allFlatEntityMaps =
      await this.flatEntityMapsCacheService.getOrRecomputeAllFlatEntityMaps({
        workspaceId,
      });
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const action of actions) {
        await this.workspaceMigrationRunnerActionHandlerRegistry.executeActionHandler(
          action.type,
          {
            action,
            allFlatEntityMaps,
            queryRunner,
            workspaceId,
          },
        );

        optimisticFlatObjectMetadataMaps =
          applyWorkspaceMigrationActionOnFlatObjectMetadataMaps({
            action,
            allFlatEntityMaps,
            workspaceId,
          });
      }

      await queryRunner.commitTransaction();

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
        try {
          await queryRunner.rollbackTransaction();
        } catch (error) {
          // eslint-disable-next-line no-console
          console.trace(`Failed to rollback transaction: ${error.message}`);
        }
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  };
}
