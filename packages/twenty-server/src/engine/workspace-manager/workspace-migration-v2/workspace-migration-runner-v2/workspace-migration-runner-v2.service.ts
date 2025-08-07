import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { WorkspaceMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-v2';
import { applyWorkspaceMigrationActionOnFlatObjectMetadataMaps } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/apply-workspace-migration-action-on-flat-object-metadata-maps';
import { WorkspaceMetadataMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-metadata-migration-runner/workspace-metadata-migration-runner-service';
import { WorkspaceSchemaMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/workspace-schema-migration-runner.service';

@Injectable()
export class WorkspaceMigrationRunnerV2Service {
  constructor(
    private readonly workspaceMetadataMigrationRunner: WorkspaceMetadataMigrationRunnerService,
    private readonly workspaceSchemaMigrationRunner: WorkspaceSchemaMigrationRunnerService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
    @InjectDataSource('core')
    private readonly coreDataSource: DataSource,
  ) {}

  run = async (workspaceMigration: WorkspaceMigrationV2) => {
    const queryRunner = this.coreDataSource.createQueryRunner();

    const { flatObjectMetadataMaps } =
      await this.workspaceMetadataCacheService.getExistingOrRecomputeFlatObjectMetadataMaps(
        {
          workspaceId: workspaceMigration.workspaceId,
        },
      );

    await queryRunner.connect();
    await queryRunner.startTransaction();
    let optimisticFlatObjectMetadataMaps = structuredClone(
      flatObjectMetadataMaps,
    );

    try {
      for (const action of workspaceMigration.actions) {
        await Promise.all([
          this.workspaceMetadataMigrationRunner.runWorkspaceMetadataMigration({
            flatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
            queryRunner,
            action,
          }),
          this.workspaceSchemaMigrationRunner.runWorkspaceSchemaMigration({
            queryRunner,
            flatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
            action,
          }),
        ]);

        optimisticFlatObjectMetadataMaps =
          applyWorkspaceMigrationActionOnFlatObjectMetadataMaps({
            action,
            flatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
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
