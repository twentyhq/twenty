import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { FlatEntityMapsCacheService } from 'src/engine/core-modules/common/services/flat-entity-maps-cache.service';
import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { WorkspaceMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-v2';
import { WorkspaceMigrationRunnerActionHandlerRegistryService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/registry/workspace-migration-runner-action-handler-registry.service';

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
  }: WorkspaceMigrationV2): Promise<AllFlatEntityMaps> => {
    const queryRunner = this.coreDataSource.createQueryRunner();

    let allFlatEntityMaps =
      await this.flatEntityMapsCacheService.getOrRecomputeAllFlatEntityMaps({
        workspaceId,
      });
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const action of actions) {
        const newOptimisticCache =
          await this.workspaceMigrationRunnerActionHandlerRegistry.executeActionHandler(
            action.type,
            {
              action,
              allFlatEntityMaps,
              queryRunner,
              workspaceId,
            },
          );
        allFlatEntityMaps = newOptimisticCache;
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

      return allFlatEntityMaps;
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
