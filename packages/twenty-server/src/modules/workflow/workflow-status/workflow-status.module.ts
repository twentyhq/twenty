import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { WorkflowStatusesUpdateJob } from 'src/modules/workflow/workflow-status/jobs/workflow-statuses-update.job';
import { WorkflowVersionStatusListener } from 'src/modules/workflow/workflow-status/listeners/workflow-version-status.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([ObjectMetadataEntity, LogicFunctionEntity]),
  ],
  providers: [WorkflowStatusesUpdateJob, WorkflowVersionStatusListener],
})
export class WorkflowStatusModule {}
