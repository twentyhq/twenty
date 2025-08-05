import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
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
    NestjsQueryTypeOrmModule.forFeature([ObjectMetadataEntity], 'core'),
  ],
  exports: [
    WorkflowSchemaModule,
    WorkflowVersionModule,
    WorkflowVersionStepModule,
    WorkflowVersionEdgeModule,
  ],
})
export class WorkflowBuilderModule {}
