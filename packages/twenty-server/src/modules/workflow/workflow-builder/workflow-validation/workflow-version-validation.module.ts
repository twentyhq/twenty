import { Module } from '@nestjs/common';

import { WorkflowMetadataReadModule } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.module';
import { WorkflowVersionValidationWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-validation/workflow-version-validation.workspace-service';

@Module({
  imports: [WorkflowMetadataReadModule],
  providers: [WorkflowVersionValidationWorkspaceService],
  exports: [WorkflowVersionValidationWorkspaceService],
})
export class WorkflowVersionValidationModule {}
