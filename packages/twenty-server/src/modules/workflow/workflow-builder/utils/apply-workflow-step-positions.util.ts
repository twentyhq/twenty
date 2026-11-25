import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

import { type WorkflowStepPositionUpdateInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-step-position-update.input';

type WorkflowNodePosition = { x: number; y: number };

export const applyWorkflowStepPositions = <
  TTrigger extends { position?: WorkflowNodePosition },
  TStep extends { id: string; position?: WorkflowNodePosition },
>({
  trigger,
  steps,
  positions,
}: {
  trigger: TTrigger | null;
  steps: TStep[] | null;
  positions: WorkflowStepPositionUpdateInput[];
}): { trigger: TTrigger | null; steps: TStep[] | null } => {
  const positionById = new Map(
    positions.map(({ id, position }) => [id, position]),
  );

  return {
    trigger:
      isDefined(trigger) && positionById.has(TRIGGER_STEP_ID)
        ? {
            ...trigger,
            position: positionById.get(TRIGGER_STEP_ID) ?? undefined,
          }
        : trigger,
    steps:
      steps?.map((step) =>
        positionById.has(step.id)
          ? { ...step, position: positionById.get(step.id) ?? undefined }
          : step,
      ) ?? null,
  };
};
