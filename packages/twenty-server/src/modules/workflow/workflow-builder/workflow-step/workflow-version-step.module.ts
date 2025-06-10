import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { WorkflowSchemaModule } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.module';
import { WorkflowVersionStepWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-step/workflow-version-step.workspace-service';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';
import { WorkflowRunnerModule } from 'src/modules/workflow/workflow-runner/workflow-runner.module';

@Module({
  imports: [
    WorkflowSchemaModule,
    ServerlessFunctionModule,
    WorkflowRunnerModule,
    WorkflowRunModule,
    NestjsQueryTypeOrmModule.forFeature([ObjectMetadataEntity], 'metadata'),
  ],
  providers: [WorkflowVersionStepWorkspaceService],
  exports: [WorkflowVersionStepWorkspaceService],
})
export class WorkflowVersionStepModule {}
