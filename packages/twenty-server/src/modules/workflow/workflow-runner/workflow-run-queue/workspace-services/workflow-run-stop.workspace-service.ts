import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { workflowHasRunningSteps } from 'src/modules/workflow/common/utils/workflow-has-running-steps.util';
import { WorkflowThrottlingWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-throttling.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

@Injectable()
export class WorkflowRunStopWorkspaceService {
  constructor(
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly workflowThrottlingWorkspaceService: WorkflowThrottlingWorkspaceService,
  ) {}

  async stopWorkflowRun(workspaceId: string, workflowRunId: string) {
    const workflowRun =
      await this.workflowRunWorkspaceService.getWorkflowRunOrFail({
        workflowRunId,
        workspaceId,
      });

    const stoppableStatuses = [
      WorkflowRunStatus.NOT_STARTED,
      WorkflowRunStatus.ENQUEUED,
      WorkflowRunStatus.RUNNING,
    ];

    if (!stoppableStatuses.includes(workflowRun.status)) {
      return {
        id: workflowRun.id,
        status: workflowRun.status,
      };
    }

    const wasNotStarted = workflowRun.status === WorkflowRunStatus.NOT_STARTED;

    let newStatus: WorkflowRunStatus;

    if (!isDefined(workflowRun.state)) {
      await this.workflowRunWorkspaceService.endWorkflowRun({
        workflowRunId,
        workspaceId,
        status: WorkflowRunStatus.STOPPED,
      });
      newStatus = WorkflowRunStatus.STOPPED;
    } else {
      const stepInfos = workflowRun.state.stepInfos;
      const steps = workflowRun.state.flow.steps;

      if (workflowHasRunningSteps({ stepInfos, steps })) {
        const isStopping =
          await this.workflowRunWorkspaceService.markWorkflowRunAsStopping({
            workflowRunId,
            workspaceId,
          });

        if (isStopping) {
          newStatus = WorkflowRunStatus.STOPPING;
        } else {
          // The run changed before the lock was taken, so report what it is now.
          const currentWorkflowRun =
            await this.workflowRunWorkspaceService.getWorkflowRunOrFail({
              workflowRunId,
              workspaceId,
            });

          newStatus = currentWorkflowRun.status;
        }
      } else {
        await this.workflowRunWorkspaceService.endWorkflowRun({
          workflowRunId,
          workspaceId,
          status: WorkflowRunStatus.STOPPED,
        });
        newStatus = WorkflowRunStatus.STOPPED;
      }
    }

    // Only after the stop is persisted, so a persistence failure can't desync the throttle counter
    if (wasNotStarted) {
      await this.workflowThrottlingWorkspaceService.decreaseWorkflowRunNotStartedCount(
        workspaceId,
      );
    }

    return {
      id: workflowRun.id,
      status: newStatus,
    };
  }
}
