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
  const parentSteps = steps.filter((parentStep) =>
    parentStep.nextStepIds?.includes(stepId),
  );

  return parentSteps.every((parentStep) =>
    Object.keys(context).includes(parentStep.id),
  );
};
