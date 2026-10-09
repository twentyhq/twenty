import { Module } from '@nestjs/common';

import { PendingWakeUpModule } from 'src/engine/core-modules/pending-wake-up/pending-wake-up.module';
import { AiAgentExecutionModule } from 'src/engine/metadata-modules/ai/ai-agent-execution/ai-agent-execution.module';
import { WorkflowStepWaitWorkspaceService } from 'src/modules/workflow/workflow-wait/services/workflow-step-wait.workspace-service';

@Module({
  imports: [AiAgentExecutionModule, PendingWakeUpModule],
  providers: [WorkflowStepWaitWorkspaceService],
  exports: [WorkflowStepWaitWorkspaceService],
})
export class WorkflowStepWaitModule {}
