import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

import { type WorkflowStepPositionUpdateInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-step-position-update.input';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export const applyWorkflowStepPositions = ({
  trigger,
  steps,
  positions,
}: {
  trigger: WorkflowTrigger | null;
  steps: WorkflowAction[] | null;
  positions: WorkflowStepPositionUpdateInput[];
}): { trigger: WorkflowTrigger | null; steps: WorkflowAction[] | null } => {
  const positionById = new Map(
    positions.map(({ id, position }) => [id, position]),
  );

  const triggerPosition = positionById.get(TRIGGER_STEP_ID);

  return {
    trigger:
      isDefined(trigger) && isDefined(triggerPosition)
        ? { ...trigger, position: triggerPosition }
        : trigger,
    steps:
      steps?.map((step) => {
        const stepPosition = positionById.get(step.id);

        return isDefined(stepPosition)
          ? { ...step, position: stepPosition }
          : step;
      }) ?? null,
  };
};
