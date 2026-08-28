import { Module } from '@nestjs/common';

import { WorkflowMetadataReadModule } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.module';
import { WorkflowVersionValidationGateService } from 'src/modules/workflow/workflow-builder/workflow-validation/workflow-version-validation-gate.service';

@Module({
  imports: [WorkflowMetadataReadModule],
  providers: [WorkflowVersionValidationGateService],
  exports: [WorkflowVersionValidationGateService],
})
export class WorkflowVersionValidationGateModule {}
