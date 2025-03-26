import { Module } from '@nestjs/common';

import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { SubscriptionsModule } from 'src/engine/subscriptions/subscriptions.module';
import { WorkflowRunListener } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.listener';

@Module({
  imports: [WorkflowCommonModule, SubscriptionsModule],
  providers: [WorkflowRunWorkspaceService, WorkflowRunListener],
  exports: [WorkflowRunWorkspaceService],
})
export class WorkflowRunModule {}
