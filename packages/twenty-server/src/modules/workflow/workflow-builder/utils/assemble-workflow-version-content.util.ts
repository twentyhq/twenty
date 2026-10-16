import { applyWorkflowStepPositions } from 'src/modules/workflow/workflow-builder/utils/apply-workflow-step-positions.util';
import { computeWorkflowStepPositions } from 'src/modules/workflow/workflow-builder/utils/compute-workflow-step-positions.util';
import { addEdgeToWorkflowVersionContent } from 'src/modules/workflow/workflow-builder/workflow-version-edge/utils/add-edge-to-workflow-version-content.util';
import { type WorkflowStepConnectionOptions } from 'src/modules/workflow/workflow-builder/workflow-version-step/types/workflow-step-connection-options.type';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export type WorkflowVersionEdge = {
  source: string;
  target: string;
  sourceConnectionOptions?: WorkflowStepConnectionOptions;
};

export const assembleWorkflowVersionContent = ({
  trigger,
  steps,
  edges,
}: {
  trigger: WorkflowTrigger;
  steps: WorkflowAction[];
  edges: WorkflowVersionEdge[];
}): { trigger: WorkflowTrigger | null; steps: WorkflowAction[] | null } => {
  const connectedContent = edges.reduce<{
    trigger: WorkflowTrigger | null;
    steps: WorkflowAction[] | null;
  }>(
    (content, edge) => {
      const { trigger, steps } = addEdgeToWorkflowVersionContent({
        ...content,
        ...edge,
      });

      return { trigger, steps };
    },
    { trigger, steps },
  );

  return applyWorkflowStepPositions({
    ...connectedContent,
    positions: computeWorkflowStepPositions({
      trigger: connectedContent.trigger,
      steps: connectedContent.steps ?? [],
    }),
  });
};
