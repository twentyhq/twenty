import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { PendingWakeUpModule } from 'src/engine/core-modules/pending-wake-up/pending-wake-up.module';
import { CodeStepBuildModule } from 'src/modules/workflow/workflow-builder/workflow-version-step/code-step/code-step-build.module';
import { WorkflowVersionStepModule } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.module';
import { WorkflowExecutorModule } from 'src/modules/workflow/workflow-executor/workflow-executor.module';
import { RunWorkflowJob } from 'src/modules/workflow/workflow-runner/jobs/run-workflow.job';
import { WorkflowRunQueueModule } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workflow-run-queue.module';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';
import { WorkflowWaitingStepWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-waiting-step.workspace-service';
import { AiAgentExecutionModule } from 'src/engine/metadata-modules/ai/ai-agent-execution/ai-agent-execution.module';
import { WorkflowAgentConversationModule } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/workflow-agent-conversation.module';
import { CoreWorkflowRunnerService } from 'src/modules/workflow/workflow-runner/services/core-workflow-runner.service';
import { WorkflowCoreModule } from 'src/engine/core-modules/workflow/workflow-core.module';
import { WorkflowVersionCoreModule } from 'src/engine/core-modules/workflow/workflow-version-core.module';
import { WorkflowExecutionContextModule } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.module';

@Module({
  imports: [
    ApplicationModule,
    WorkflowExecutorModule,
    BillingModule,
    WorkflowRunModule,
    MetricsModule,
    WorkflowRunQueueModule,
    WorkflowVersionStepModule,
    CodeStepBuildModule,
    WorkflowCoreModule,
    WorkflowVersionCoreModule,
    WorkflowExecutionContextModule,
    AiAgentExecutionModule,
    WorkflowAgentConversationModule,
    PendingWakeUpModule,
  ],
  providers: [
    WorkflowRunnerWorkspaceService,
    CoreWorkflowRunnerService,
    RunWorkflowJob,
    WorkflowWaitingStepWorkspaceService,
  ],
  exports: [WorkflowRunnerWorkspaceService, CoreWorkflowRunnerService],
})
export class WorkflowRunnerModule {}
