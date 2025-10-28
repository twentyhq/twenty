import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { WorkspaceEventEmitterModule } from 'src/engine/workspace-event-emitter/workspace-event-emitter.module';
import { WorkflowStatusesUpdateJob } from 'src/modules/workflow/workflow-status/jobs/workflow-statuses-update.job';
import { WorkflowVersionStatusListener } from 'src/modules/workflow/workflow-status/listeners/workflow-version-status.listener';

@Module({
  imports: [
    ServerlessFunctionModule,
    WorkspaceEventEmitterModule,
    TypeOrmModule.forFeature([ObjectMetadataEntity, ServerlessFunctionEntity]),
  ],
  providers: [WorkflowStatusesUpdateJob, WorkflowVersionStatusListener],
})
export class WorkflowStatusModule {}
