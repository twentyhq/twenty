import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { RecordPositionModule } from 'src/engine/core-modules/record-position/record-position.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { DeleteWorkflowRunsCommand } from 'src/modules/workflow/workflow-runner/workflow-run/command/delete-workflow-runs.command';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

@Module({
  imports: [
    WorkflowCommonModule,
    NestjsQueryTypeOrmModule.forFeature([
      ObjectMetadataEntity,
      WorkspaceEntity,
    ]),
    RecordPositionModule,
    CacheLockModule,
    MetricsModule,
    WorkspaceIteratorModule,
  ],
  providers: [WorkflowRunWorkspaceService, DeleteWorkflowRunsCommand],
  exports: [WorkflowRunWorkspaceService, DeleteWorkflowRunsCommand],
})
export class WorkflowRunModule {}
