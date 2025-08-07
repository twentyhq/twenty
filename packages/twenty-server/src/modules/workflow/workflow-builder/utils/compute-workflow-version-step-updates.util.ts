import { WorkflowVersionStepChangesDTO } from 'src/engine/core-modules/workflow/dtos/workflow-version-step-changes.dto';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export const computeWorkflowVersionStepChanges = ({
  trigger,
  steps,
  createdStep,
  deletedStepIds,
}: {
  trigger: WorkflowTrigger | null;
  steps: WorkflowAction[] | null;
  createdStep?: WorkflowAction;
  deletedStepIds?: string[];
}): WorkflowVersionStepChangesDTO => {
  return {
    triggerNextStepIds: trigger?.nextStepIds,
    stepsNextStepIds: Object.fromEntries(
      (steps || []).map((step) => [step.id, step.nextStepIds]),
    ),
    createdStep,
    deletedStepIds,
  };
};
