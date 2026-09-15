import { Module } from '@nestjs/common';

import { WorkflowSchemaModule } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.module';
import { WorkflowVersionStepModule } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.module';
import { WorkflowVersionModule } from 'src/modules/workflow/workflow-builder/workflow-version/workflow-version.module';
import { WorkflowVersionEdgeModule } from 'src/modules/workflow/workflow-builder/workflow-version-edge/workflow-version-edge.module';

@Module({
  imports: [
    WorkflowSchemaModule,
    WorkflowVersionModule,
    WorkflowVersionStepModule,
    WorkflowVersionEdgeModule,
  ],
  exports: [
    WorkflowSchemaModule,
    WorkflowVersionModule,
    WorkflowVersionStepModule,
    WorkflowVersionEdgeModule,
  ],
})
export class WorkflowBuilderModule {}
