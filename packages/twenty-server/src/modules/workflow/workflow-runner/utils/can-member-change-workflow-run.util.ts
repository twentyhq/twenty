import isEqual from 'lodash.isequal';
import { isDefined } from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const canMemberChangeWorkflowRun = ({
  workflowRun,
  owningApplication,
  workspaceMemberId,
  replacementStep,
}: {
  workflowRun: Pick<WorkflowRunWorkspaceEntity, 'createdBy' | 'state'>;
  owningApplication: Pick<FlatApplication, 'id'> | null;
  workspaceMemberId: string | undefined;
  replacementStep?: WorkflowAction;
}): boolean => {
  if (!isDefined(owningApplication)) {
    return true;
  }

  if (
    !isDefined(workspaceMemberId) ||
    workspaceMemberId !== workflowRun.createdBy.workspaceMemberId
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
