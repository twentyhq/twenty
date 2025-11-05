import { Module } from '@nestjs/common';

import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ToolModule } from 'src/engine/core-modules/tool/tool.module';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowActionFactory } from 'src/modules/workflow/workflow-executor/factories/workflow-action.factory';
import { AiAgentActionModule } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/ai-agent-action.module';
import { CodeActionModule } from 'src/modules/workflow/workflow-executor/workflow-actions/code/code-action.module';
import { DelayActionModule } from 'src/modules/workflow/workflow-executor/workflow-actions/delay/delay-action.module';
import { EmptyActionModule } from 'src/modules/workflow/workflow-executor/workflow-actions/empty/empty-action.module';
import { FilterActionModule } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/filter-action.module';
import { FormActionModule } from 'src/modules/workflow/workflow-executor/workflow-actions/form/form-action.module';
import { IteratorActionModule } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/iterator-action.module';
import { RecordCRUDActionModule } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/record-crud-action.module';
import { ToolExecutorWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/tool-executor-workflow-action';
import { WorkflowExecutorWorkspaceService } from 'src/modules/workflow/workflow-executor/workspace-services/workflow-executor.workspace-service';
import { WorkflowRunQueueModule } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workflow-run-queue.module';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';

@Module({
  imports: [
    WorkflowCommonModule,
    CodeActionModule,
    DelayActionModule,
    RecordCRUDActionModule,
    FormActionModule,
    WorkflowRunModule,
    BillingModule,
    FilterActionModule,
    IteratorActionModule,
    AiAgentActionModule,
    EmptyActionModule,
    FeatureFlagModule,
    WorkflowRunQueueModule,
    ToolModule,
  ],
  providers: [
    WorkflowExecutorWorkspaceService,
    ScopedWorkspaceContextFactory,
    WorkflowActionFactory,
    ToolExecutorWorkflowAction,
  ],
  exports: [WorkflowExecutorWorkspaceService],
})
export class WorkflowExecutorModule {}
