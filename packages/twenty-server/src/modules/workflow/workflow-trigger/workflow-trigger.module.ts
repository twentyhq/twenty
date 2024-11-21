import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowRunnerModule } from 'src/modules/workflow/workflow-runner/workflow-runner.module';
import { DatabaseEventTriggerModule } from 'src/modules/workflow/workflow-trigger/database-event-trigger/database-event-trigger.module';
import { WorkflowEventTriggerJob } from 'src/modules/workflow/workflow-trigger/jobs/workflow-event-trigger.job';
import { WorkflowTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/workspace-services/workflow-trigger.workspace-service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

@Module({
  imports: [
    WorkflowCommonModule,
    WorkflowRunnerModule,
    DatabaseEventTriggerModule,
    NestjsQueryTypeOrmModule.forFeature([ObjectMetadataEntity], 'metadata'),
  ],
  providers: [
    WorkflowTriggerWorkspaceService,
    ScopedWorkspaceContextFactory,
    WorkflowEventTriggerJob,
  ],
  exports: [WorkflowTriggerWorkspaceService],
})
export class WorkflowTriggerModule {}
