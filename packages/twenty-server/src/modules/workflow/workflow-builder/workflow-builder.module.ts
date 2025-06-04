import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkflowSchemaModule } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.module';
import { WorkflowVersionStepModule } from 'src/modules/workflow/workflow-builder/workflow-step/workflow-version-step.module';
import { WorkflowVersionModule } from 'src/modules/workflow/workflow-builder/workflow-version/workflow-version.module';

@Module({
  imports: [
    WorkflowSchemaModule,
    WorkflowVersionModule,
    WorkflowVersionStepModule,
    NestjsQueryTypeOrmModule.forFeature([ObjectMetadataEntity], 'core'),
  ],
  exports: [
    WorkflowSchemaModule,
    WorkflowVersionModule,
    WorkflowVersionStepModule,
  ],
})
export class WorkflowBuilderModule {}
