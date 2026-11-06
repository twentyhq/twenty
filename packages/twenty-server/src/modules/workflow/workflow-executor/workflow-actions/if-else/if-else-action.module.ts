import { Module } from '@nestjs/common';

import { WorkflowMetadataReadModule } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.module';
import { WorkflowSchemaModule } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.module';
import { StepFilterVariableSourcesWorkspaceService } from 'src/modules/workflow/workflow-executor/workspace-services/step-filter-variable-sources.workspace-service';
import { IfElseWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/if-else.workflow-action';

@Module({
  imports: [WorkflowMetadataReadModule, WorkflowSchemaModule],
  providers: [IfElseWorkflowAction, StepFilterVariableSourcesWorkspaceService],
  exports: [IfElseWorkflowAction],
})
export class IfElseActionModule {}
