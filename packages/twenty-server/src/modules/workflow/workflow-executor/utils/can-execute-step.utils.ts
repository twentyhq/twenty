import { isDefined } from 'twenty-shared/utils';

import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const canExecuteStep = ({
  context,
  stepId,
  steps,
}: {
  steps: WorkflowAction[];
  context: Record<string, unknown>;
  stepId: string;
}) => {
  const parentSteps = steps.filter(
    (parentStep) =>
      isDefined(parentStep) && parentStep.nextStepIds?.includes(stepId),
  );

  // TODO use workflowRun.state to check if step status is not COMPLETED. Return false in this case
  return parentSteps.every((parentStep) =>
    Object.keys(context).includes(parentStep.id),
  );
};
