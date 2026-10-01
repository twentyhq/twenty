import {
  buildWorkflowGraph,
  computeWorkflowLayout,
  TRIGGER_STEP_ID,
  WORKFLOW_DIAGRAM_DEFAULT_NODE_DIMENSIONS,
} from 'twenty-shared/workflow';

import { type WorkflowStepPositionUpdateInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-step-position-update.input';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export const computeWorkflowStepPositions = ({
  trigger,
  steps,
}: {
  trigger: WorkflowTrigger | null;
  steps: WorkflowAction[];
}): WorkflowStepPositionUpdateInput[] => {
  const { childrenByStepId } = buildWorkflowGraph({ trigger, steps });

  const nodes = [
    { id: TRIGGER_STEP_ID, ...WORKFLOW_DIAGRAM_DEFAULT_NODE_DIMENSIONS },
    ...steps.map((step) => ({
      id: step.id,
      ...WORKFLOW_DIAGRAM_DEFAULT_NODE_DIMENSIONS,
    })),
  ];

  const edges = [...childrenByStepId.entries()].flatMap(([source, targets]) =>
    targets.map((target) => ({ source, target })),
  );

  return computeWorkflowLayout({ nodes, edges }).map(
    ({ id, centerPosition }) => ({ id, position: centerPosition }),
  );
};
