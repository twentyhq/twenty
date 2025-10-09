import { Injectable } from '@nestjs/common';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { isWorkflowDelayAction } from 'src/modules/workflow/workflow-executor/workflow-actions/delay/guards/is-workflow-delay-action.guard';

export type ResumeDelayedJobData = {
  workspaceId: string;
  workflowRunId: string;
  stepId: string;
};

@Injectable()
export class DelayWorkflowAction implements WorkflowAction {
  constructor(
    @InjectMessageQueue(MessageQueue.workflowDelayedJobsQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async execute({
    currentStepId,
    steps,
    runInfo,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = findStepOrThrow({
      stepId: currentStepId,
      steps,
    });

    if (!isWorkflowDelayAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a delay action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const settings = step.settings.input;
    let delayInMs: number;

    if (settings.delayType === 'schedule_date') {
      if (!settings.scheduledDateTime) {
        throw new WorkflowStepExecutorException(
          'Scheduled date time is required for scheduled date delay',
          WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
        );
      }

      const scheduledDate = new Date(settings.scheduledDateTime);
      const now = new Date();

      delayInMs = scheduledDate.getTime() - now.getTime();
    } else if (settings.delayType === 'duration') {
      if (!settings.duration) {
        throw new WorkflowStepExecutorException(
          'Duration is required for duration delay',
          WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
        );
      }

      const { days, hours, minutes, seconds } = settings.duration;

      delayInMs =
        days * 24 * 60 * 60 * 1000 +
        hours * 60 * 60 * 1000 +
        minutes * 60 * 1000 +
        seconds * 1000;
    } else {
      throw new WorkflowStepExecutorException(
        'Invalid delay type',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    await this.messageQueueService.add<ResumeDelayedJobData>(
      'ResumeDelayedJob',
      {
        workspaceId: runInfo.workspaceId,
        workflowRunId: runInfo.workflowRunId,
        stepId: currentStepId,
      },
      {
        delay: delayInMs,
      },
    );

    return {
      pendingEvent: true,
    };
  }
}
