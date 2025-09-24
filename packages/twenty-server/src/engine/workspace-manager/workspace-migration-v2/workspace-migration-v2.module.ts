import { Module } from '@nestjs/common';

import { WorkspaceMetadataCacheModule } from 'src/engine/metadata-modules/workspace-metadata-cache/workspace-metadata-cache.module';
import { WorkspaceMigrationBuildOrchestratorService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-build-orchestrator.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';
import { WorkspaceMigrationBuilderV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.module';
import { WorkspaceMigrationRunnerV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-migration-runner-v2.module';

@Module({
  imports: [
    WorkspaceMigrationBuilderV2Module,
    WorkspaceMigrationRunnerV2Module,
    WorkspaceMetadataCacheModule,
  ],
  providers: [
    WorkspaceMigrationValidateBuildAndRunService,
    WorkspaceMigrationBuildOrchestratorService,
  ],
  exports: [
    WorkspaceMigrationValidateBuildAndRunService,
    WorkspaceMigrationBuildOrchestratorService,
  ],
})
export class WorkspaceMigrationV2Module {}
