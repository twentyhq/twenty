import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { RecordPositionModule } from 'src/engine/core-modules/record-position/record-position.module';
import { AiAgentExecutionModule } from 'src/engine/metadata-modules/ai/ai-agent-execution/ai-agent-execution.module';
import { WorkflowRunRecordShareModule } from 'src/engine/core-modules/workflow/workflow-run-record-share.module';
import { DeleteWorkflowRunsCommand } from 'src/modules/workflow/workflow-runner/workflow-run/command/delete-workflow-runs.command';
import { WorkflowRunStepLogWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-step-log.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { WorkflowStepWaitModule } from 'src/modules/workflow/workflow-wait/workflow-step-wait.module';

@Module({
  imports: [
    RecordPositionModule,
    CacheLockModule,
    MetricsModule,
    WorkspaceIteratorModule,
    WorkflowRunRecordShareModule,
    AiAgentExecutionModule,
    WorkflowStepWaitModule,
  ],
  providers: [
    WorkflowRunWorkspaceService,
    WorkflowRunStepLogWorkspaceService,
    DeleteWorkflowRunsCommand,
  ],
  exports: [WorkflowRunWorkspaceService, WorkflowRunStepLogWorkspaceService],
})
export class WorkflowRunModule {}
