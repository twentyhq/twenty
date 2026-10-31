import { Module } from '@nestjs/common';

import { AiAgentModule } from 'src/engine/metadata-modules/ai/ai-agent/ai-agent.module';
import { WorkflowMetadataReadModule } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.module';
import { WorkflowVersionValidationWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-validation/workflow-version-validation.workspace-service';

@Module({
  imports: [WorkflowMetadataReadModule, AiAgentModule],
  providers: [WorkflowVersionValidationWorkspaceService],
  exports: [WorkflowVersionValidationWorkspaceService],
})
export class WorkflowVersionValidationModule {}
