import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { AgentModule } from 'src/engine/metadata-modules/agent/agent.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowSchemaModule } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.module';
import { WorkflowVersionStepWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.workspace-service';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';
import { WorkflowRunnerModule } from 'src/modules/workflow/workflow-runner/workflow-runner.module';

@Module({
  imports: [
    AgentModule,
    WorkflowSchemaModule,
    ServerlessFunctionModule,
    WorkflowRunnerModule,
    WorkflowRunModule,
    WorkflowCommonModule,
    NestjsQueryTypeOrmModule.forFeature([ObjectMetadataEntity], 'core'),
  ],
  providers: [WorkflowVersionStepWorkspaceService],
  exports: [WorkflowVersionStepWorkspaceService],
})
export class WorkflowVersionStepModule {}
