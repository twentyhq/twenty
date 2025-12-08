import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowRunnerModule } from 'src/modules/workflow/workflow-runner/workflow-runner.module';
import { AutomatedTriggerModule } from 'src/modules/workflow/workflow-trigger/automated-trigger/automated-trigger.module';
import { WorkflowTriggerJob } from 'src/modules/workflow/workflow-trigger/jobs/workflow-trigger.job';
import { WorkflowTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/workspace-services/workflow-trigger.workspace-service';

@Module({
  imports: [
    WorkflowCommonModule,
    WorkflowRunnerModule,
    AutomatedTriggerModule,
    NestjsQueryTypeOrmModule.forFeature([ObjectMetadataEntity]),
  ],
  providers: [WorkflowTriggerWorkspaceService, WorkflowTriggerJob],
  exports: [WorkflowTriggerWorkspaceService],
})
export class WorkflowTriggerModule {}
