import { Injectable } from '@nestjs/common';

import { type WorkflowStepWait } from 'twenty-shared/workflow';

import { PendingWakeUpService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up.service';
import { AgentRunService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run.service';

@Injectable()
export class WorkflowStepWaitWorkspaceService {
  constructor(
    private readonly pendingWakeUpService: PendingWakeUpService,
    private readonly agentRunService: AgentRunService,
  ) {}

  // A callback wait is resolved by what the step handed its work to, so it is not stored
  async arm({
    workspaceId,
    workflowRunId,
    stepId,
    wait,
  }: {
    workspaceId: string;
    workflowRunId: string;
    stepId: string;
    wait: WorkflowStepWait;
  }): Promise<void> {
    if (wait.type === 'CALLBACK') {
      return;
    }

    await this.pendingWakeUpService.arm({
      workspaceId,
      owner: { type: 'WORKFLOW_STEP', id: workflowRunId, key: stepId },
      condition: wait,
    });
  }

  async cancelStepWait({
    workspaceId,
    workflowRunId,
    stepId,
  }: {
    workspaceId: string;
    workflowRunId: string;
    stepId: string;
  }): Promise<void> {
    await this.cancel({
      workspaceId,
      owner: { type: 'WORKFLOW_STEP', id: workflowRunId, key: stepId },
    });
  }

  async cancelRunWaits({
    workspaceId,
    workflowRunId,
  }: {
    workspaceId: string;
    workflowRunId: string;
  }): Promise<void> {
    await this.cancel({
      workspaceId,
      owner: { type: 'WORKFLOW_STEP', id: workflowRunId },
    });
  }

  // a call a step posted for an answer no longer looks waiting once the step stops waiting
  private async cancel(
    args: Parameters<PendingWakeUpService['cancel']>[0],
  ): Promise<void> {
    await this.agentRunService.closePostedCalls({
      workspaceId: args.workspaceId,
      cancelledWakeUps: await this.pendingWakeUpService.cancel(args),
    });
  }
}
