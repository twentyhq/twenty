import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { RecordPositionModule } from 'src/engine/core-modules/record-position/record-position.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { DeleteWorkflowRunsCommand } from 'src/modules/workflow/workflow-runner/workflow-run/command/delete-workflow-runs.command';
import { WorkflowRunStepLogWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-step-log.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

@Module({
  imports: [
    WorkflowCommonModule,
    RecordPositionModule,
    CacheLockModule,
    MetricsModule,
    WorkspaceIteratorModule,
    FeatureFlagModule,
  ],
  providers: [
    WorkflowRunWorkspaceService,
    WorkflowRunStepLogWorkspaceService,
    DeleteWorkflowRunsCommand,
  ],
  exports: [
    WorkflowRunWorkspaceService,
    WorkflowRunStepLogWorkspaceService,
    DeleteWorkflowRunsCommand,
  ],
})
export class WorkflowRunModule {}
