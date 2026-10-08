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
import { computeWorkflowDurationInMs } from 'src/modules/workflow/workflow-executor/utils/compute-workflow-duration-in-ms.util';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { WAIT_FOR_EVENT_NAME_PATTERN } from 'src/modules/workflow/workflow-executor/workflow-actions/wait-for-event/constants/wait-for-event-name-pattern.constant';
import { isWorkflowWaitForEventAction } from 'src/modules/workflow/workflow-executor/workflow-actions/wait-for-event/guards/is-workflow-wait-for-event-action.guard';
import { type WorkflowWaitForEventActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/wait-for-event/types/workflow-wait-for-event-action-input.type';

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

    // a record set in the step that resolves to nothing would otherwise widen the wait to every record
    if (
      isNonEmptyString(step.settings.input.recordId) &&
      !isNonEmptyString(recordId)
    ) {
      throw new WorkflowStepExecutorException(
        'The record to wait for resolved to no record',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    if (!WAIT_FOR_EVENT_NAME_PATTERN.test(eventName)) {
      throw new WorkflowStepExecutorException(
        `Invalid event to wait for: "${eventName}"`,
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    const timeoutInMs = isDefined(timeout)
      ? computeWorkflowDurationInMs(timeout)
      : 0;

    return {
      wait: {
        type: 'EVENT',
        eventName,
        ...(isNonEmptyString(recordId) ? { recordId } : {}),
        ...(isNonEmptyArray(updatedFields) ? { updatedFields } : {}),
        ...(timeoutInMs > 0
          ? { expiresAt: new Date(Date.now() + timeoutInMs).toISOString() }
          : {}),
      },
    };
  }
}
