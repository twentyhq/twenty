import { isDefined } from 'twenty-shared/utils';

import { isWorkflowIfElseAction } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/guards/is-workflow-if-else-action.guard';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

/**
 * Returns the steps that can lead into `step`.
 *
 * A parent is any step whose `nextStepIds` includes `step.id`. For IF_ELSE
 * steps the outgoing edges live on each branch (`branches[].nextStepIds`)
 * rather than on the step-level `nextStepIds`, so those are included as well.
 *
 * Without this, a step reached only through an IF_ELSE branch has no
 * detectable parent. When branches re-converge onto a shared downstream step,
 * the not-taken branch marks that step SKIPPED and — because the IF_ELSE is not
 * recognised as a parent — it is never revived, silently halting the run before
 * the convergence point.
 */
export const getParentSteps = (
  step: WorkflowAction,
  steps: WorkflowAction[],
): WorkflowAction[] =>
  steps.filter((parentStep) => {
    if (!isDefined(parentStep)) {
      return false;
    }

    if (parentStep.nextStepIds?.includes(step.id)) {
      return true;
    }

    if (isWorkflowIfElseAction(parentStep)) {
      return (parentStep.settings.input.branches ?? []).some((branch) =>
        branch.nextStepIds?.includes(step.id),
      );
    }

    return false;
  });
