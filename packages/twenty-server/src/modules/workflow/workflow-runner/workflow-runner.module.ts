import { Module } from '@nestjs/common';

import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowVersionStepModule } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.module';
import { WorkflowExecutorModule } from 'src/modules/workflow/workflow-executor/workflow-executor.module';
import { RunWorkflowJob } from 'src/modules/workflow/workflow-runner/jobs/run-workflow.job';
import { WorkflowRunQueueModule } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workflow-run-queue.module';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';

@Module({
  imports: [
    WorkflowCommonModule,
    WorkflowExecutorModule,
    BillingModule,
    WorkflowRunModule,
    MetricsModule,
    WorkflowRunQueueModule,
    WorkflowVersionStepModule,
  ],
  providers: [WorkflowRunnerWorkspaceService, RunWorkflowJob],
  exports: [WorkflowRunnerWorkspaceService],
})
export class WorkflowRunnerModule {}
