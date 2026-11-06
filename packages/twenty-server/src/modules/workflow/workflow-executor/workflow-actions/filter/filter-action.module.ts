import { Module } from '@nestjs/common';

import { WorkflowMetadataReadModule } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.module';
import { WorkflowSchemaModule } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.module';
import { StepFilterVariableSourcesWorkspaceService } from 'src/modules/workflow/workflow-executor/workspace-services/step-filter-variable-sources.workspace-service';
import { FilterWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/filter.workflow-action';

@Module({
  imports: [WorkflowMetadataReadModule, WorkflowSchemaModule],
  providers: [FilterWorkflowAction, StepFilterVariableSourcesWorkspaceService],
  exports: [FilterWorkflowAction],
})
export class FilterActionModule {}
