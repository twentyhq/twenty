import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceMetadataMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-metadata-migration-runner/workspace-metadata-migration-runner.service';
import { WorkspaceSchemaMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/workspace-schema-migration-runner.service';

@Module({
  imports: [FeatureFlagModule],
  providers: [
    WorkspaceMetadataMigrationRunnerService,
    WorkspaceSchemaMigrationRunnerService,
  ],
  exports: [],
})
export class WorkspaceMigrationRunnerV2Module {}
