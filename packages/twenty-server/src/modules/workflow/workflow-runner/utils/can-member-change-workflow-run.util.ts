import isEqual from 'lodash.isequal';
import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const canMemberChangeWorkflowRun = ({
  workflowRun,
  boundingApplication,
  workspaceMemberId,
  callerApplicationId,
  replacementStep,
}: {
  workflowRun: {
    createdBy: Pick<ActorMetadata, 'workspaceMemberId'>;
    state: { flow?: { steps?: WorkflowAction[] } } | null;
  };
  boundingApplication: Pick<FlatApplication, 'id'> | null;
  workspaceMemberId: string | undefined;
  callerApplicationId: string | undefined;
  replacementStep?: WorkflowAction;
}): boolean => {
  if (!isDefined(boundingApplication)) {
    return true;
  }

  if (
    !isDefined(workspaceMemberId) ||
    workspaceMemberId !== workflowRun.createdBy.workspaceMemberId
  ) {
    return false;
  }

  if (
    isDefined(callerApplicationId) &&
    callerApplicationId !== boundingApplication.id
  ) {
    return false;
  }

  if (!isDefined(replacementStep)) {
    return true;
  }

  const existingStep = workflowRun.state?.flow?.steps?.find(
    (step) => step.id === replacementStep.id,
  );

  if (existingStep?.type !== WorkflowActionType.FORM) {
    return false;
  }

  return isEqual(
    withoutFormInput(existingStep),
    withoutFormInput(replacementStep),
  );
};

const withoutFormInput = (step: WorkflowAction) => ({
  ...step,
  settings: { ...step.settings, input: undefined },
});
