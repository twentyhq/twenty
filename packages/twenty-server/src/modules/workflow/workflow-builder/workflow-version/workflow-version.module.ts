import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { RecordPositionModule } from 'src/engine/core-modules/record-position/record-position.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { WorkflowSchemaModule } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.module';
import { WorkflowVersionStepModule } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.module';
import { WorkflowVersionWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version/workflow-version.workspace-service';

@Module({
  imports: [
    WorkflowSchemaModule,
    ServerlessFunctionModule,
    WorkflowVersionStepModule,
    NestjsQueryTypeOrmModule.forFeature([ObjectMetadataEntity], 'core'),
    RecordPositionModule,
  ],
  providers: [WorkflowVersionWorkspaceService],
  exports: [WorkflowVersionWorkspaceService],
})
export class WorkflowVersionModule {}
