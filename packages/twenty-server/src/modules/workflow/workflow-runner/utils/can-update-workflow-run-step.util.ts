import isEqual from 'lodash.isequal';
import { WorkflowActionType } from 'twenty-shared/workflow';

import {
  type WorkflowAction,
  type WorkflowFormAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const canUpdateWorkflowRunStep = ({
  workflowRun,
  step,
}: {
  workflowRun: {
    state: { flow?: { steps?: WorkflowAction[] } } | null;
  };
  step: WorkflowAction;
}): boolean => {
  const existingStep = workflowRun.state?.flow?.steps?.find(
    ({ id }) => id === step.id,
  );

  if (
    existingStep?.type !== WorkflowActionType.FORM ||
    step.type !== WorkflowActionType.FORM ||
    !Array.isArray(step.settings?.input)
  ) {
    return false;
  }

  return (
    existingStep.name === step.name &&
    isEqual(existingStep.nextStepIds, step.nextStepIds) &&
    isEqual(
      getFormFieldDefinitions(existingStep),
      getFormFieldDefinitions(step),
    )
  );
};

const getFormFieldDefinitions = (step: WorkflowFormAction) =>
  step.settings.input.map(({ id, name, type, settings }) => ({
    id,
    name,
    type,
    settings,
  }));
