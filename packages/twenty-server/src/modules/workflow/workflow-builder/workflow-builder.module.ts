import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkflowToolRegistryWorkspaceService } from 'src/modules/workflow/workflow-builder/services/workflow-tool-registration.workspace-service';
import { WorkflowSchemaModule } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.module';
import { WorkflowVersionEdgeModule } from 'src/modules/workflow/workflow-builder/workflow-version-edge/workflow-version-edge.module';
import { WorkflowVersionStepModule } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.module';
import { WorkflowVersionModule } from 'src/modules/workflow/workflow-builder/workflow-version/workflow-version.module';
import { WorkflowTriggerModule } from 'src/modules/workflow/workflow-trigger/workflow-trigger.module';

@Module({
  imports: [
    WorkflowSchemaModule,
    WorkflowVersionModule,
    WorkflowVersionStepModule,
    WorkflowVersionEdgeModule,
    WorkflowTriggerModule,
    NestjsQueryTypeOrmModule.forFeature([ObjectMetadataEntity], 'core'),
  ],
  providers: [WorkflowToolRegistryWorkspaceService],
  exports: [
    WorkflowSchemaModule,
    WorkflowVersionModule,
    WorkflowVersionStepModule,
    WorkflowVersionEdgeModule,
    WorkflowToolRegistryWorkspaceService,
  ],
})
export class WorkflowBuilderModule {}
