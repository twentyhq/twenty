import { Logger, Scope } from '@nestjs/common';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowExecutorWorkspaceService } from 'src/modules/workflow/workflow-executor/workspace-services/workflow-executor.workspace-service';
import {
  WorkflowRunException,
  WorkflowRunExceptionCode,
} from 'src/modules/workflow/workflow-runner/exceptions/workflow-run.exception';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-run.workspace-service';

export type RunWorkflowJobData = {
  workspaceId: string;
  workflowVersionId: string;
  workflowRunId: string;
  payload: object;
};

@Processor({ queueName: MessageQueue.workflowQueue, scope: Scope.REQUEST })
export class RunWorkflowJob {
  private readonly logger = new Logger(RunWorkflowJob.name);
  constructor(
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly workflowExecutorWorkspaceService: WorkflowExecutorWorkspaceService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly throttlerService: ThrottlerService,
    private readonly environmentService: EnvironmentService,
  ) {}

  @Process(RunWorkflowJob.name)
  async handle({
    workflowVersionId,
    workflowRunId,
    payload,
  }: RunWorkflowJobData): Promise<void> {
    await this.workflowRunWorkspaceService.startWorkflowRun(workflowRunId);

    try {
      const workflowVersion =
        await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail(
          workflowVersionId,
        );

      await this.throttleExecution(workflowVersion.workflowId);

      const { steps, status } =
        await this.workflowExecutorWorkspaceService.execute({
          currentStepIndex: 0,
          steps: workflowVersion.steps || [],
          context: {
            trigger: payload,
          },
          output: {
            steps: {},
            status: WorkflowRunStatus.RUNNING,
          },
        });

      await this.workflowRunWorkspaceService.endWorkflowRun(
        workflowRunId,
        status,
        {
          steps,
        },
      );
    } catch (error) {
      await this.workflowRunWorkspaceService.endWorkflowRun(
        workflowRunId,
        WorkflowRunStatus.FAILED,
        {
          steps: {},
          error: error.message,
        },
      );
    }
  }

  private async throttleExecution(workflowId: string) {
    try {
      await this.throttlerService.throttle(
        `${workflowId}-workflow-execution`,
        this.environmentService.get('WORKFLOW_EXEC_THROTTLE_LIMIT'),
        this.environmentService.get('WORKFLOW_EXEC_THROTTLE_TTL'),
      );
    } catch (error) {
      throw new WorkflowRunException(
        'Workflow execution rate limit exceeded',
        WorkflowRunExceptionCode.WORKFLOW_RUN_LIMIT_REACHED,
      );
    }
  }
}
