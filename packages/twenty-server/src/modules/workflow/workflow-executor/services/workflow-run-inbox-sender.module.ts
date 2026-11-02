import { Module } from '@nestjs/common';

import { WorkflowCoreModule } from 'src/engine/core-modules/workflow/workflow-core.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkflowRunInboxSenderWorkspaceService } from 'src/modules/workflow/workflow-executor/services/workflow-run-inbox-sender.workspace-service';

@Module({
  imports: [WorkflowCoreModule, WorkspaceCacheModule],
  providers: [WorkflowRunInboxSenderWorkspaceService],
  exports: [WorkflowRunInboxSenderWorkspaceService],
})
export class WorkflowRunInboxSenderModule {}
