import { Module } from '@nestjs/common';

import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowMetadataReadModule } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.module';
import { WorkflowSchemaModule } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.module';

import { WorkflowVersionNonActivableGateService } from './workflow-version-non-activable-gate.service';

@Module({
  imports: [
    WorkflowCommonModule,
    WorkflowMetadataReadModule,
    WorkflowSchemaModule,
  ],
  providers: [WorkflowVersionNonActivableGateService],
  exports: [WorkflowVersionNonActivableGateService],
})
export class WorkflowVersionNonActivableGateModule {}
