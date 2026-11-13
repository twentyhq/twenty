import { Module } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { McpServerClientModule } from 'src/engine/metadata-modules/mcp-server/mcp-server-client.module';
import { WorkflowExecutionContextModule } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.module';
import { McpToolWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/mcp-tool/mcp-tool.workflow-action';
import { McpToolCallService } from 'src/modules/workflow/workflow-executor/workflow-actions/mcp-tool/services/mcp-tool-call.service';
import { McpToolStepTestService } from 'src/modules/workflow/workflow-executor/workflow-actions/mcp-tool/services/mcp-tool-step-test.service';

@Module({
  imports: [
    WorkflowExecutionContextModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    McpServerClientModule,
  ],
  providers: [
    McpToolCallService,
    McpToolWorkflowAction,
    McpToolStepTestService,
  ],
  exports: [McpToolWorkflowAction, McpToolStepTestService],
})
export class McpToolActionModule {}
