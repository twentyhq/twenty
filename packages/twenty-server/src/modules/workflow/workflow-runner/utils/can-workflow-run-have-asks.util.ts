import { isDefined } from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { type WorkflowRunState } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

// Only a form step or an agent step's conversation ever opens an Ask, and the
// run state already says whether it has either, so most runs end without
// touching the Asks at all.
export const canWorkflowRunHaveAsks = (
  state: WorkflowRunState | null | undefined,
): boolean =>
  (state?.flow?.steps ?? []).some(
    (step) => step.type === WorkflowActionType.FORM,
  ) ||
  Object.values(state?.stepInfos ?? {}).some((stepInfo) =>
    isDefined(stepInfo?.threadId),
  );
