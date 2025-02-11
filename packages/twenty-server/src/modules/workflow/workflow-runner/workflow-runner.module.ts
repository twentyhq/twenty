import { Module } from '@nestjs/common';

import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowExecutorModule } from 'src/modules/workflow/workflow-executor/workflow-executor.module';
import { RunWorkflowJob } from 'src/modules/workflow/workflow-runner/jobs/run-workflow.job';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';

@Module({
  imports: [
    WorkflowCommonModule,
    WorkflowExecutorModule,
    ThrottlerModule,
    BillingModule,
    WorkflowRunModule,
  ],
  providers: [WorkflowRunnerWorkspaceService, RunWorkflowJob],
  exports: [WorkflowRunnerWorkspaceService],
})
export class WorkflowRunnerModule {}
