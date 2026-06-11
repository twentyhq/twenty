import { type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { shouldExecuteStep } from 'src/modules/workflow/workflow-executor/utils/should-execute-step.util';
import { isWorkflowIteratorAction } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/guards/is-workflow-iterator-action.guard';
import { getAllStepIdsInLoop } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/utils/get-all-step-ids-in-loop.util';
import { getIteratorInitialLoopStepIds } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/utils/get-iterator-initial-loop-step-ids.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const getResumeFrontierStepIds = ({
  steps,
  stepInfos,
}: {
  steps: WorkflowAction[];
  stepInfos: WorkflowRunStepInfos;
}): string[] => {
  const loopInteriorStepIds = new Set<string>();

  for (const step of steps) {
    if (!isWorkflowIteratorAction(step)) {
      continue;
    }

    const loopStepIds = getAllStepIdsInLoop({
      iteratorStepId: step.id,
      initialLoopStepIds: getIteratorInitialLoopStepIds(step),
      steps,
    });

    for (const loopStepId of loopStepIds) {
      loopInteriorStepIds.add(loopStepId);
    }
  }

  return steps
    .filter((step) => {
      if (loopInteriorStepIds.has(step.id)) {
        return false;
      }

      return shouldExecuteStep({
        step,
        steps,
        stepInfos,
        workflowRunStatus: WorkflowRunStatus.RUNNING,
      });
    })
    .map((step) => step.id);
};
