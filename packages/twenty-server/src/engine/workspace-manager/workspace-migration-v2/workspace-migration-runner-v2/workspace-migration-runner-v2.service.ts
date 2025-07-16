import { Injectable } from '@nestjs/common';
import { WorkspaceMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-v2';
import { WorkspaceMetadataMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-metadata-migration-runner/workspace-metadata-migration-runner.service';
import { WorkspaceSchemaMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/workspace-schema-migration-runner.service';
import { DataSource } from 'typeorm';

@Injectable()
export class WorkspaceMigrationV2Runner {
  constructor(
    private readonly workspaceMetadataMigrationRunner: WorkspaceMetadataMigrationRunnerService,
    private readonly workspaceSchemaMigrationRunner: WorkspaceSchemaMigrationRunnerService,
    private readonly coreDataSource: DataSource,
  ) {}

  run = async (workspaceMigration: WorkspaceMigrationV2) => {
    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await Promise.all([
        this.workspaceMetadataMigrationRunner.runWorkspaceMetadataMigration({
          queryRunner,
          workspaceMigration,
        }),
        this.workspaceSchemaMigrationRunner.runWorkspaceSchemaMigration({
          queryRunner,
          workspaceMigration,
        }),
      ]);

      await queryRunner.commitTransaction();
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
