import { Module } from '@nestjs/common';

import { WorkflowMetadataReadModule } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.module';
import { StepFilterVariableSourcesModule } from 'src/modules/workflow/workflow-executor/workspace-services/step-filter-variable-sources.module';
import { FilterWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/filter.workflow-action';

@Module({
  imports: [WorkflowMetadataReadModule, StepFilterVariableSourcesModule],
  providers: [FilterWorkflowAction],
  exports: [FilterWorkflowAction],
})
export class FilterActionModule {}
