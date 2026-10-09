import { Module } from '@nestjs/common';

import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { WorkflowThrottlingWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-throttling.workspace-service';

@Module({
  imports: [ThrottlerModule],
  providers: [WorkflowThrottlingWorkspaceService],
  exports: [WorkflowThrottlingWorkspaceService],
})
export class WorkflowThrottlingModule {}
