import { Injectable } from '@nestjs/common';

import { resolveInput } from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input.type';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { isWorkflowDelayAction } from 'src/modules/workflow/workflow-executor/workflow-actions/delay/guards/is-workflow-delay-action.guard';
import { WorkflowDelayActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/delay/types/workflow-delay-action-input.type';

@Injectable()
export class DelayWorkflowAction implements WorkflowAction {
  async execute({
    currentStepId,
    steps,
    context,
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

    const workflowActionInput = resolveInput(
      step.settings.input,
      context,
    ) as WorkflowDelayActionInput;

    let delayInMs: number;

    if (workflowActionInput.delayType === 'SCHEDULED_DATE') {
      if (!workflowActionInput.scheduledDateTime) {
        throw new WorkflowStepExecutorException(
          'Scheduled date time is required for scheduled date delay',
          WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
        );
      }

      const scheduledDate = new Date(workflowActionInput.scheduledDateTime);
      const now = new Date();

      delayInMs = scheduledDate.getTime() - now.getTime();

      if (delayInMs < 0) {
        throw new WorkflowStepExecutorException(
          'Scheduled date cannot be in the past',
          WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
        );
      }
    } else if (workflowActionInput.delayType === 'DURATION') {
      if (!workflowActionInput.duration) {
        throw new WorkflowStepExecutorException(
          'Duration is required for duration delay',
          WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
        );
      }

      const {
        days = 0,
        hours = 0,
        minutes = 0,
        seconds = 0,
      } = workflowActionInput.duration;

      delayInMs =
        days * 24 * 60 * 60 * 1000 +
        hours * 60 * 60 * 1000 +
        minutes * 60 * 1000 +
        seconds * 1000;
    } else {
      throw new WorkflowStepExecutorException(
        'Invalid delay type',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    return {
      wait: {
        type: 'TIME',
        resumeAt: new Date(Date.now() + delayInMs).toISOString(),
      },
    };
  }
}
