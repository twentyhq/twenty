import isEqual from 'lodash.isequal';
import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
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
    createdBy: Pick<ActorMetadata, 'context'>;
    state: { flow?: { steps?: WorkflowAction[] } } | null;
  };
  step: WorkflowAction;
}): boolean => {
  if (!isDefined(workflowRun.createdBy.context?.applicationId)) {
    return true;
  }

  const existingStep = workflowRun.state?.flow?.steps?.find(
    ({ id }) => id === step.id,
  );

  if (
    existingStep?.type !== WorkflowActionType.FORM ||
    step.type !== WorkflowActionType.FORM
  ) {
    return false;
  }

  return isEqual(withoutFormValues(existingStep), withoutFormValues(step));
};

const withoutFormValues = (step: WorkflowFormAction) => ({
  ...step,
  settings: {
    ...step.settings,
    input: step.settings.input.map((field) => ({ ...field, value: undefined })),
  },
});
