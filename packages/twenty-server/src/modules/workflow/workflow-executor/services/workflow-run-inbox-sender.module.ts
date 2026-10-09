import { Module } from '@nestjs/common';

import { WorkflowCoreModule } from 'src/engine/core-modules/workflow/workflow-core.module';
import { WorkflowRunInboxSenderWorkspaceService } from 'src/modules/workflow/workflow-executor/services/workflow-run-inbox-sender.workspace-service';

@Module({
  imports: [WorkflowCoreModule],
  providers: [WorkflowRunInboxSenderWorkspaceService],
  exports: [WorkflowRunInboxSenderWorkspaceService],
})
export class WorkflowRunInboxSenderModule {}
