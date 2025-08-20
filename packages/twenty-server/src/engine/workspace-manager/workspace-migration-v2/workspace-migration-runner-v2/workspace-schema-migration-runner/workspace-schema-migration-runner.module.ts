import { Module } from '@nestjs/common';

import { WorkspaceSchemaMigrationRunnerActionHandlersModule } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/action-handlers/workspace-schema-migration-runner-action-handlers.module';
import { WorkspaceSchemaMigrationRunnerCoreModule } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/core/workspace-schema-migration-runner-core.module';
import { WorkspaceSchemaMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/services/workspace-schema-migration-runner.service';

@Module({
  imports: [
    WorkspaceSchemaMigrationRunnerCoreModule,
    WorkspaceSchemaMigrationRunnerActionHandlersModule,
  ],
  providers: [WorkspaceSchemaMigrationRunnerService],
  exports: [WorkspaceSchemaMigrationRunnerService],
})
export class WorkspaceSchemaMigrationRunnerModule {}
