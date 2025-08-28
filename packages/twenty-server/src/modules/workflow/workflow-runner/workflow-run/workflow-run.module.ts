import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { RecordPositionModule } from 'src/engine/core-modules/record-position/record-position.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { DeleteWorkflowRunsCommand } from 'src/modules/workflow/workflow-runner/workflow-run/command/delete-workflow-runs.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [
    WorkflowCommonModule,
    NestjsQueryTypeOrmModule.forFeature(
      [ObjectMetadataEntity, Workspace],
      'core',
    ),
    RecordPositionModule,
    CacheLockModule,
    MetricsModule,
  ],
  providers: [
    WorkflowRunWorkspaceService,
    ScopedWorkspaceContextFactory,
    DeleteWorkflowRunsCommand,
  ],
  exports: [WorkflowRunWorkspaceService, DeleteWorkflowRunsCommand],
})
export class WorkflowRunModule {}
