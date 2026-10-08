import { Global, Module } from '@nestjs/common';

import { WORKFLOW_TOOL_SERVICE_TOKEN } from 'src/engine/core-modules/tool-provider/constants/workflow-tool-service.token';
import { CoreWorkflowServicesModule } from 'src/engine/core-modules/workflow/core-workflow-services.module';
import { AiAgentModule } from 'src/engine/metadata-modules/ai/ai-agent/ai-agent.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { LogicFunctionModule } from 'src/engine/metadata-modules/logic-function/logic-function.module';
import { WorkflowSchemaModule } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.module';

import { WorkflowToolWorkspaceService } from './services/workflow-tool.workspace-service';

// Global module to make WORKFLOW_TOOL_SERVICE_TOKEN available to ToolProviderModule
// without creating a circular dependency (ToolProviderModule cannot import this module directly)
@Global()
@Module({
  imports: [
    CoreWorkflowServicesModule,
    WorkflowSchemaModule,
    LogicFunctionModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    AiAgentModule,
  ],
  providers: [
    WorkflowToolWorkspaceService,
    {
      provide: WORKFLOW_TOOL_SERVICE_TOKEN,
      useExisting: WorkflowToolWorkspaceService,
    },
  ],
  exports: [WorkflowToolWorkspaceService, WORKFLOW_TOOL_SERVICE_TOKEN],
})
export class WorkflowToolsModule {}
