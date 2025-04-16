import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const insertStep = ({
  existingSteps,
  insertedStep,
  parentStepId,
  nextStepId,
}: {
  existingSteps: WorkflowAction[];
  insertedStep: WorkflowAction;
  parentStepId?: string;
  nextStepId?: string;
}): WorkflowAction[] => {
  const updatedExistingSteps = existingSteps.map((existingStep) => {
    if (existingStep.id === parentStepId) {
      return {
        ...existingStep,
        nextStepIds: [
          ...new Set([
            ...(existingStep.nextStepIds?.filter((id) => id !== nextStepId) ||
              []),
            insertedStep.id,
          ]),
        ],
      };
    }

    return existingStep;
  });

  return [
    ...updatedExistingSteps,
    {
      ...insertedStep,
      nextStepIds: nextStepId ? [nextStepId] : undefined,
    },
  ];
};
