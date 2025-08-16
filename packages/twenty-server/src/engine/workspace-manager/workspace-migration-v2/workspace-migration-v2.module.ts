import { Module } from '@nestjs/common';

import { WorkspaceMigrationBuilderV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.module';
import { WorkspaceMigrationRunnerV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-migration-runner-v2.module';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-validate-build-and-run-service';

@Module({
  imports: [
    WorkspaceMigrationBuilderV2Module,
    WorkspaceMigrationRunnerV2Module,
  ],
  providers: [WorkspaceMigrationValidateBuildAndRunService],
  exports: [
    WorkspaceMigrationRunnerV2Module,
    WorkspaceMigrationBuilderV2Module,
    WorkspaceMigrationValidateBuildAndRunService,
  ],
})
export class WorkspaceMigrationV2Module {}
