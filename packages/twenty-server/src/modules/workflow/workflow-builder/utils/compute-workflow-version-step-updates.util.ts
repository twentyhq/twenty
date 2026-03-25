import { isDefined } from 'class-validator';
import diff, { type Difference } from 'microdiff';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export const computeWorkflowVersionStepChanges = ({
  existingTrigger,
  existingSteps,
  updatedTrigger,
  updatedSteps,
}: {
  existingTrigger: WorkflowTrigger | null;
  existingSteps: WorkflowAction[] | null;
  updatedTrigger?: WorkflowTrigger | null;
  updatedSteps?: WorkflowAction[] | null;
}) => {
  const triggerDiff: Difference[] =
    updatedTrigger !== undefined
      ? diff({ trigger: existingTrigger }, { trigger: updatedTrigger })
      : [];

  const stepsDiff: Difference[] = isDefined(updatedSteps)
    ? diff({ steps: existingSteps }, { steps: updatedSteps })
    : [];

  return { triggerDiff, stepsDiff };
};
