import { Module } from '@nestjs/common';

import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';

@Module({
  imports: [
    UserWorkspaceModule,
    WorkflowRunModule,
    WorkspaceCacheModule,
    CoreEntityCacheModule,
  ],
  providers: [WorkflowExecutionContextService],
  exports: [WorkflowExecutionContextService],
})
export class WorkflowExecutionContextModule {}
