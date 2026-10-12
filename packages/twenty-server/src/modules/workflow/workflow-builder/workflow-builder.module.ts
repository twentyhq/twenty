import { Module } from '@nestjs/common';

import { WorkflowSchemaModule } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.module';
import { WorkflowVersionStepModule } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.module';

@Module({
  imports: [WorkflowSchemaModule, WorkflowVersionStepModule],
  exports: [WorkflowSchemaModule, WorkflowVersionStepModule],
})
export class WorkflowBuilderModule {}
