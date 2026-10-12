import { Module } from '@nestjs/common';

import { WorkflowSchemaModule } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.module';
import { WorkflowVersionStepModule } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.module';
import { WorkflowVersionEdgeModule } from 'src/modules/workflow/workflow-builder/workflow-version-edge/workflow-version-edge.module';

@Module({
  imports: [
    WorkflowSchemaModule,
    WorkflowVersionStepModule,
    WorkflowVersionEdgeModule,
  ],
  exports: [
    WorkflowSchemaModule,
    WorkflowVersionStepModule,
    WorkflowVersionEdgeModule,
  ],
})
export class WorkflowBuilderModule {}
