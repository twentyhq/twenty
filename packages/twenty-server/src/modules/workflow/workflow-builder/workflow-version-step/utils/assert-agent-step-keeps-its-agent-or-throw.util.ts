import { isNonEmptyString } from '@sniptt/guards';
import { WorkflowActionType } from 'twenty-shared/workflow';

import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const assertAgentStepKeepsItsAgentOrThrow = ({
  existingStep,
  step,
}: {
  existingStep: WorkflowAction;
  step: WorkflowAction;
}): void => {
  if (
    existingStep.type !== WorkflowActionType.AI_AGENT ||
    step.type !== WorkflowActionType.AI_AGENT ||
    !isNonEmptyString(existingStep.settings.input.agentId) ||
    isNonEmptyString(step.settings.input.agentId)
  ) {
    return;
  }

  throw new WorkflowVersionStepException(
    `Agent step "${existingStep.name}" must keep its agent. Send settings.input.agentId "${existingStep.settings.input.agentId}" unchanged.`,
    WorkflowVersionStepExceptionCode.INVALID_REQUEST,
  );
};
