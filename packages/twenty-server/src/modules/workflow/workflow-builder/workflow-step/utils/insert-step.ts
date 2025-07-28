import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export const insertStep = ({
  existingSteps,
  existingTrigger,
  insertedStep,
  parentStepId,
  nextStepId,
}: {
  existingSteps: WorkflowAction[];
  existingTrigger: WorkflowTrigger | null;
  insertedStep: WorkflowAction;
  parentStepId?: string;
  nextStepId?: string;
}): {
  updatedSteps: WorkflowAction[];
  updatedInsertedStep: WorkflowAction;
  updatedTrigger: WorkflowTrigger | null;
} => {
  let updatedTrigger = existingTrigger;

  let updatedExistingSteps = existingSteps;

  if (parentStepId === 'trigger') {
    if (!existingTrigger) {
      throw new Error('Cannot insert step from undefined trigger');
    }

    updatedTrigger = {
      ...existingTrigger,
      nextStepIds: [
        ...new Set([
          ...(existingTrigger.nextStepIds?.filter((id) => id !== nextStepId) ||
            []),
          insertedStep.id,
        ]),
      ],
    };
  } else {
    updatedExistingSteps = existingSteps.map((existingStep) => {
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
  }

  const updatedInsertedStep = {
    ...insertedStep,
    nextStepIds: nextStepId ? [nextStepId] : undefined,
  };

  return {
    updatedSteps: [...updatedExistingSteps, updatedInsertedStep],
    updatedTrigger,
    updatedInsertedStep,
  };
};
