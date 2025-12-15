import { Scope } from '@nestjs/common';

import { StepStatus } from 'twenty-shared/workflow';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { RESUME_DELAYED_WORKFLOW_JOB_NAME } from 'src/modules/workflow/workflow-executor/workflow-actions/delay/contants/resume-delayed-workflow-job-name';
import { isWorkflowDelayAction } from 'src/modules/workflow/workflow-executor/workflow-actions/delay/guards/is-workflow-delay-action.guard';
import { ResumeDelayedWorkflowJobData } from 'src/modules/workflow/workflow-executor/workflow-actions/delay/types/resume-delayed-workflow-job-data.type';
import {
  WorkflowRunException,
  WorkflowRunExceptionCode,
} from 'src/modules/workflow/workflow-runner/exceptions/workflow-run.exception';
import { RunWorkflowJob } from 'src/modules/workflow/workflow-runner/jobs/run-workflow.job';
import { type RunWorkflowJobData } from 'src/modules/workflow/workflow-runner/types/run-workflow-job-data.type';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

@Processor({
  queueName: MessageQueue.delayedJobsQueue,
  scope: Scope.REQUEST,
})
export class ResumeDelayedWorkflowJob {
  constructor(
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  @Process(RESUME_DELAYED_WORKFLOW_JOB_NAME)
  async handle({
    workspaceId,
    workflowRunId,
    stepId,
  }: ResumeDelayedWorkflowJobData): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        try {
          const workflowRun =
            await this.workflowRunWorkspaceService.getWorkflowRunOrFail({
              workflowRunId,
              workspaceId,
            });

          if (workflowRun.status !== WorkflowRunStatus.RUNNING) {
            return;
          }

          const step = workflowRun.state?.flow?.steps?.find(
            (step) => step.id === stepId,
          );

          const stepInfo = workflowRun.state?.stepInfos[stepId];

          if (!step || !isWorkflowDelayAction(step)) {
            throw new WorkflowRunException(
              'Step not found or is not a delay action',
              WorkflowRunExceptionCode.INVALID_INPUT,
            );
          }

          if (stepInfo?.status !== StepStatus.PENDING) {
            throw new WorkflowRunException(
              'Step is not pending',
              WorkflowRunExceptionCode.INVALID_INPUT,
            );
          }

          await this.workflowRunWorkspaceService.updateWorkflowRunStepInfo({
            stepId,
            stepInfo: {
              status: StepStatus.SUCCESS,
              result: {
                success: true,
              },
            },
            workspaceId,
            workflowRunId,
          });

          await this.messageQueueService.add<RunWorkflowJobData>(
            RunWorkflowJob.name,
            {
              workspaceId,
              workflowRunId,
              lastExecutedStepId: stepId,
            },
          );
        } catch (error) {
          await this.workflowRunWorkspaceService.endWorkflowRun({
            workflowRunId,
            workspaceId,
            status: WorkflowRunStatus.FAILED,
            error:
              error instanceof Error
                ? error.message
                : 'Unknown error during delay resume',
          });
        }
      },
    );
  }
}
