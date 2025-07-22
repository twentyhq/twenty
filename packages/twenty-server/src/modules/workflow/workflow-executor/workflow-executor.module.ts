import { Module } from '@nestjs/common';

import { AiModule } from 'src/engine/core-modules/ai/ai.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowActionFactory } from 'src/modules/workflow/workflow-executor/factories/workflow-action.factory';
import { AiAgentActionModule } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/ai-agent-action.module';
import { CodeActionModule } from 'src/modules/workflow/workflow-executor/workflow-actions/code/code-action.module';
import { FilterActionModule } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/filter-action.module';
import { FormActionModule } from 'src/modules/workflow/workflow-executor/workflow-actions/form/form-action.module';
import { RecordCRUDActionModule } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/record-crud-action.module';
import { ToolExecutorWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/tool-executor-workflow-action';
import { WorkflowExecutorWorkspaceService } from 'src/modules/workflow/workflow-executor/workspace-services/workflow-executor.workspace-service';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';

@Module({
  imports: [
    WorkflowCommonModule,
    CodeActionModule,
    RecordCRUDActionModule,
    FormActionModule,
    WorkflowRunModule,
    BillingModule,
    FilterActionModule,
    AiAgentActionModule,
    FeatureFlagModule,
    AiModule,
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
