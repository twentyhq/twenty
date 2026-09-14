import { Module } from '@nestjs/common';

import { WorkflowMetadataReadModule } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.module';
import { WorkflowVersionBlockingMalformedGateService } from 'src/modules/workflow/workflow-builder/workflow-validation/workflow-version-blocking-malformed-gate.service';

@Module({
  imports: [WorkflowMetadataReadModule],
  providers: [WorkflowVersionBlockingMalformedGateService],
  exports: [WorkflowVersionBlockingMalformedGateService],
})
export class WorkflowVersionBlockingMalformedGateModule {}
