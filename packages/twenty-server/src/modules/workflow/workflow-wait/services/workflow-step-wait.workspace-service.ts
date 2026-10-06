import { Injectable } from '@nestjs/common';

import { type WorkflowStepWait } from 'twenty-shared/workflow';

import { PendingWakeUpService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up.service';

@Injectable()
export class WorkflowStepWaitWorkspaceService {
  constructor(private readonly pendingWakeUpService: PendingWakeUpService) {}

  // An answer wait is resolved through the step's conversation, so it is not stored
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
    if (wait.type === 'ANSWER') {
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
    await this.pendingWakeUpService.cancel({
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
    await this.pendingWakeUpService.cancelAllForOwner({
      workspaceId,
      ownerType: 'WORKFLOW_STEP',
      ownerId: workflowRunId,
    });
  }
}
