import { WorkflowVersionStepUpdatesDTO } from 'src/engine/core-modules/workflow/dtos/workflow-version-step-updates.dto';
import { WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const computeWorkflowVersionStepUpdates = ({
  trigger,
  steps,
  createdStep,
  deletedStepId,
}: {
  trigger: WorkflowTrigger | null;
  steps: WorkflowAction[] | null;
  createdStep?: WorkflowAction;
  deletedStepId?: string;
}): WorkflowVersionStepUpdatesDTO => {
  return {
    triggerNextStepIds: trigger?.nextStepIds,
    stepsNextStepIds: Object.fromEntries(
      (steps || []).map((step) => [step.id, step.nextStepIds]),
    ),
    createdStep,
    deletedStepId,
  };
};
