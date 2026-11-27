import { Module } from '@nestjs/common';

import { WorkflowVersionCoreModule } from 'src/engine/core-modules/workflow/workflow-version-core.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkflowRunInboxSenderWorkspaceService } from 'src/modules/workflow/workflow-executor/services/workflow-run-inbox-sender.workspace-service';

@Module({
  imports: [WorkflowVersionCoreModule, WorkspaceCacheModule],
  providers: [WorkflowRunInboxSenderWorkspaceService],
  exports: [WorkflowRunInboxSenderWorkspaceService],
})
export class WorkflowRunInboxSenderModule {}
