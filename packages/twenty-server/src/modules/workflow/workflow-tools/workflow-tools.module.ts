import { Module } from '@nestjs/common';

import { RecordPositionModule } from 'src/engine/core-modules/record-position/record-position.module';
import { ToolGeneratorModule } from 'src/engine/core-modules/tool-generator/tool-generator.module';
import { WorkflowSchemaModule } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.module';
import { WorkflowVersionEdgeModule } from 'src/modules/workflow/workflow-builder/workflow-version-edge/workflow-version-edge.module';
import { WorkflowVersionStepModule } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.module';
import { WorkflowVersionModule } from 'src/modules/workflow/workflow-builder/workflow-version/workflow-version.module';
import { WorkflowTriggerModule } from 'src/modules/workflow/workflow-trigger/workflow-trigger.module';

import { WorkflowToolWorkspaceService } from './services/workflow-tool.workspace-service';

@Module({
  imports: [
    WorkflowVersionStepModule,
    WorkflowVersionEdgeModule,
    WorkflowVersionModule,
    WorkflowTriggerModule,
    WorkflowSchemaModule,
    RecordPositionModule,
    ToolGeneratorModule,
  ],
  providers: [WorkflowToolWorkspaceService],
  exports: [WorkflowToolWorkspaceService],
})
export class WorkflowToolsModule {}
