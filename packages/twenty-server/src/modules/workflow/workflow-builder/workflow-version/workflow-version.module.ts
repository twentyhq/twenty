import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { WorkflowSchemaModule } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.module';
import { WorkflowVersionStepModule } from 'src/modules/workflow/workflow-builder/workflow-version/workflow-step/workflow-version-step.module';
import { WorkflowVersionStepWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version/workflow-step/workflow-version-step.workspace-service';
import { WorkflowVersionWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version/workflow-version.workspace-service';

@Module({
  imports: [
    WorkflowVersionStepModule,
    WorkflowSchemaModule,
    ServerlessFunctionModule,
    NestjsQueryTypeOrmModule.forFeature([ObjectMetadataEntity], 'metadata'),
  ],
  providers: [
    WorkflowVersionWorkspaceService,
    WorkflowVersionStepWorkspaceService,
  ],
  exports: [
    WorkflowVersionWorkspaceService,
    WorkflowVersionStepWorkspaceService,
  ],
})
export class WorkflowVersionModule {}
