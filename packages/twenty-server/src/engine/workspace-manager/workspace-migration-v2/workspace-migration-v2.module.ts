import { Module } from '@nestjs/common';

import { WorkspaceMigrationBuilderV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.module';
import { WorkspaceMigrationRunnerV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-migration-runner-v2.module';

@Module({
  imports: [
    WorkspaceMigrationBuilderV2Module,
    WorkspaceMigrationRunnerV2Module,
  ],
  providers: [],
  exports: [WorkspaceMigrationRunnerV2Module],
})
export class WorkspaceMigrationV2Module {}
