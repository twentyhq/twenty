import { Module } from '@nestjs/common';

import { WorkflowSchemaModule } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.module';
import { StepFilterVariableSourcesWorkspaceService } from 'src/modules/workflow/workflow-executor/workspace-services/step-filter-variable-sources.workspace-service';

@Module({
  imports: [WorkflowSchemaModule],
  providers: [StepFilterVariableSourcesWorkspaceService],
  exports: [StepFilterVariableSourcesWorkspaceService],
})
export class StepFilterVariableSourcesModule {}
