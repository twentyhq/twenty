import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray, resolveInput } from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input.type';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { WAIT_FOR_EVENT_NAME_PATTERN } from 'src/modules/workflow/workflow-executor/workflow-actions/wait-for-event/constants/wait-for-event-name-pattern.constant';
import { isWorkflowWaitForEventAction } from 'src/modules/workflow/workflow-executor/workflow-actions/wait-for-event/guards/is-workflow-wait-for-event-action.guard';
import { type WorkflowWaitForEventActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/wait-for-event/types/workflow-wait-for-event-action-input.type';
import { computeWaitTimeoutInMs } from 'src/modules/workflow/workflow-executor/workflow-actions/wait-for-event/utils/compute-wait-timeout-in-ms.util';

@Injectable()
export class WaitForEventWorkflowAction implements WorkflowAction {
  async execute({
    currentStepId,
    steps,
    context,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = findStepOrThrow({
      stepId: currentStepId,
      steps,
    });

    if (!isWorkflowWaitForEventAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a wait for event action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const { eventName, recordId, updatedFields, timeout } = resolveInput(
      step.settings.input,
      context,
    ) as WorkflowWaitForEventActionInput;

    if (!WAIT_FOR_EVENT_NAME_PATTERN.test(eventName)) {
      throw new WorkflowStepExecutorException(
        `Invalid event to wait for: "${eventName}"`,
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    const timeoutInMs = computeWaitTimeoutInMs(timeout);

    return {
      wait: {
        type: 'EVENT',
        eventName,
        ...(isNonEmptyString(recordId) ? { recordId } : {}),
        ...(isNonEmptyArray(updatedFields) ? { updatedFields } : {}),
        ...(isDefined(timeoutInMs)
          ? { expiresAt: new Date(Date.now() + timeoutInMs).toISOString() }
          : {}),
      },
    };
  }
}
