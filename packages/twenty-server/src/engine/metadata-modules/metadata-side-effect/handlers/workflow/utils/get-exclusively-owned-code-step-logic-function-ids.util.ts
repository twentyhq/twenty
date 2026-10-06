import { isNonEmptyString } from '@sniptt/guards';
import { isValidUuid } from 'twenty-shared/utils';

import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';
import { isWorkflowCodeAction } from 'src/modules/workflow/workflow-executor/workflow-actions/code/guards/is-workflow-code-action.guard';
import { isWorkflowLogicFunctionAction } from 'src/modules/workflow/workflow-executor/workflow-actions/logic-function/guards/is-workflow-logic-function-action.guard';

type WorkflowVersionSteps = Pick<FlatWorkflowVersion, 'steps'>;

const collectLogicFunctionIds = ({
  workflowVersions,
  includeLogicFunctionSteps,
}: {
  workflowVersions: WorkflowVersionSteps[];
  includeLogicFunctionSteps: boolean;
}): string[] =>
  workflowVersions.flatMap(({ steps }) =>
    (steps ?? []).flatMap((step) => {
      const logicFunctionId =
        isWorkflowCodeAction(step) ||
        (includeLogicFunctionSteps && isWorkflowLogicFunctionAction(step))
          ? step.settings.input.logicFunctionId
          : undefined;

      return isNonEmptyString(logicFunctionId) && isValidUuid(logicFunctionId)
        ? [logicFunctionId]
        : [];
    }),
  );

export const getExclusivelyOwnedCodeStepLogicFunctionIds = ({
  deletedWorkflowVersions,
  remainingWorkflowVersions,
}: {
  deletedWorkflowVersions: WorkflowVersionSteps[];
  remainingWorkflowVersions: WorkflowVersionSteps[];
}): string[] => {
  const referencedElsewhere = new Set(
    collectLogicFunctionIds({
      workflowVersions: remainingWorkflowVersions,
      includeLogicFunctionSteps: true,
    }),
  );

  return [
    ...new Set(
      collectLogicFunctionIds({
        workflowVersions: deletedWorkflowVersions,
        includeLogicFunctionSteps: false,
      }),
    ),
  ].filter((logicFunctionId) => !referencedElsewhere.has(logicFunctionId));
};
