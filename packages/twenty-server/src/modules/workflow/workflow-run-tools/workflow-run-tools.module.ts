import { Global, Module } from '@nestjs/common';

import { WORKFLOW_RUN_TOOL_SERVICE_TOKEN } from 'src/engine/core-modules/tool-provider/constants/workflow-run-tool-service.token';
import { WorkflowTriggerModule } from 'src/modules/workflow/workflow-trigger/workflow-trigger.module';

import { WorkflowRunToolWorkspaceService } from './services/workflow-run-tool.workspace-service';

// Global module to make WORKFLOW_RUN_TOOL_SERVICE_TOKEN available to
// ToolProviderModule without creating a circular dependency.
@Global()
@Module({
  imports: [WorkflowTriggerModule],
  providers: [
    WorkflowRunToolWorkspaceService,
    {
      provide: WORKFLOW_RUN_TOOL_SERVICE_TOKEN,
      useExisting: WorkflowRunToolWorkspaceService,
    },
  ],
  exports: [WorkflowRunToolWorkspaceService, WORKFLOW_RUN_TOOL_SERVICE_TOKEN],
})
export class WorkflowRunToolsModule {}
