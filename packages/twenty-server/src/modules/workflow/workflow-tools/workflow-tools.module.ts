import { Module } from '@nestjs/common';

import { CoreWorkflowServicesModule } from 'src/engine/core-modules/workflow/core-workflow-services.module';
import { AiAgentModule } from 'src/engine/metadata-modules/ai/ai-agent/ai-agent.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { LogicFunctionModule } from 'src/engine/metadata-modules/logic-function/logic-function.module';
import { WorkflowSchemaModule } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.module';
import { WorkflowVersionStepModule } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.module';
import { ActivateWorkflowVersionTool } from 'src/modules/workflow/workflow-tools/tools/activate-workflow-version.tool';
import { ComputeStepOutputSchemaTool } from 'src/modules/workflow/workflow-tools/tools/compute-step-output-schema.tool';
import { CreateCompleteWorkflowTool } from 'src/modules/workflow/workflow-tools/tools/create-complete-workflow.tool';
import { CreateDraftFromWorkflowVersionTool } from 'src/modules/workflow/workflow-tools/tools/create-draft-from-workflow-version.tool';
import { CreateWorkflowVersionEdgeTool } from 'src/modules/workflow/workflow-tools/tools/create-workflow-version-edge.tool';
import { CreateWorkflowVersionStepTool } from 'src/modules/workflow/workflow-tools/tools/create-workflow-version-step.tool';
import { DeactivateWorkflowVersionTool } from 'src/modules/workflow/workflow-tools/tools/deactivate-workflow-version.tool';
import { DeleteWorkflowVersionEdgeTool } from 'src/modules/workflow/workflow-tools/tools/delete-workflow-version-edge.tool';
import { DeleteWorkflowVersionStepTool } from 'src/modules/workflow/workflow-tools/tools/delete-workflow-version-step.tool';
import { DeleteWorkflowTool } from 'src/modules/workflow/workflow-tools/tools/delete-workflow.tool';
import { GetLogicFunctionSourceTool } from 'src/modules/workflow/workflow-tools/tools/get-logic-function-source.tool';
import { GetWorkflowCurrentVersionTool } from 'src/modules/workflow/workflow-tools/tools/get-workflow-current-version.tool';
import { GetWorkflowRunTool } from 'src/modules/workflow/workflow-tools/tools/get-workflow-run.tool';
import { ListLogicFunctionToolsTool } from 'src/modules/workflow/workflow-tools/tools/list-logic-function-tools.tool';
import { ListWorkflowRunsTool } from 'src/modules/workflow/workflow-tools/tools/list-workflow-runs.tool';
import { ListWorkflowsTool } from 'src/modules/workflow/workflow-tools/tools/list-workflows.tool';
import { RunWorkflowVersionTool } from 'src/modules/workflow/workflow-tools/tools/run-workflow-version.tool';
import { UpdateLogicFunctionSourceTool } from 'src/modules/workflow/workflow-tools/tools/update-logic-function-source.tool';
import { UpdateWorkflowVersionPositionsTool } from 'src/modules/workflow/workflow-tools/tools/update-workflow-version-positions.tool';
import { UpdateWorkflowVersionStepTool } from 'src/modules/workflow/workflow-tools/tools/update-workflow-version-step.tool';
import { UpdateWorkflowVersionTriggerTool } from 'src/modules/workflow/workflow-tools/tools/update-workflow-version-trigger.tool';
import { ValidateWorkflowTool } from 'src/modules/workflow/workflow-tools/tools/validate-workflow.tool';

@Module({
  imports: [
    CoreWorkflowServicesModule,
    WorkflowSchemaModule,
    LogicFunctionModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    AiAgentModule,
    WorkflowVersionStepModule,
  ],
  providers: [
    CreateCompleteWorkflowTool,
    CreateWorkflowVersionStepTool,
    UpdateWorkflowVersionStepTool,
    UpdateWorkflowVersionTriggerTool,
    DeleteWorkflowVersionStepTool,
    CreateWorkflowVersionEdgeTool,
    DeleteWorkflowVersionEdgeTool,
    CreateDraftFromWorkflowVersionTool,
    UpdateWorkflowVersionPositionsTool,
    ActivateWorkflowVersionTool,
    DeactivateWorkflowVersionTool,
    ComputeStepOutputSchemaTool,
    GetWorkflowCurrentVersionTool,
    ListWorkflowsTool,
    DeleteWorkflowTool,
    RunWorkflowVersionTool,
    GetWorkflowRunTool,
    ListWorkflowRunsTool,
    GetLogicFunctionSourceTool,
    UpdateLogicFunctionSourceTool,
    ListLogicFunctionToolsTool,
    ValidateWorkflowTool,
  ],
})
export class WorkflowToolsModule {}
