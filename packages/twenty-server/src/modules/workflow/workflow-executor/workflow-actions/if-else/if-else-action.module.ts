import { Module } from '@nestjs/common';

import { WorkflowMetadataReadModule } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.module';
import { StepFilterVariableSourcesModule } from 'src/modules/workflow/workflow-executor/workspace-services/step-filter-variable-sources.module';
import { IfElseWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/if-else.workflow-action';

@Module({
  imports: [WorkflowMetadataReadModule, StepFilterVariableSourcesModule],
  providers: [IfElseWorkflowAction],
  exports: [IfElseWorkflowAction],
})
export class IfElseActionModule {}
