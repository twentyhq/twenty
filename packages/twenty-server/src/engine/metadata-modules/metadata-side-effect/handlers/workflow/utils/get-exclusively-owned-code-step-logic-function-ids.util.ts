import { isNonEmptyString } from '@sniptt/guards';
import { isValidUuid } from 'twenty-shared/utils';

import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';
import { isWorkflowCodeAction } from 'src/modules/workflow/workflow-executor/workflow-actions/code/guards/is-workflow-code-action.guard';
import { isWorkflowLogicFunctionAction } from 'src/modules/workflow/workflow-executor/workflow-actions/logic-function/guards/is-workflow-logic-function-action.guard';

type WorkflowVersionSteps = Pick<FlatWorkflowVersion, 'steps'>;

const isLogicFunctionId = (
  logicFunctionId: string | undefined,
): logicFunctionId is string =>
  isNonEmptyString(logicFunctionId) && isValidUuid(logicFunctionId);

const getCodeStepLogicFunctionIds = (
  workflowVersions: WorkflowVersionSteps[],
): string[] =>
  workflowVersions
    .flatMap(({ steps }) => (steps ?? []).filter(isWorkflowCodeAction))
    .map((step) => step.settings.input.logicFunctionId)
    .filter(isLogicFunctionId);

const getLogicFunctionStepLogicFunctionIds = (
  workflowVersions: WorkflowVersionSteps[],
): string[] =>
  workflowVersions
    .flatMap(({ steps }) => (steps ?? []).filter(isWorkflowLogicFunctionAction))
    .map((step) => step.settings.input.logicFunctionId)
    .filter(isLogicFunctionId);

export const getExclusivelyOwnedCodeStepLogicFunctionIds = ({
  deletedWorkflowVersions,
  remainingWorkflowVersions,
}: {
  deletedWorkflowVersions: WorkflowVersionSteps[];
  remainingWorkflowVersions: WorkflowVersionSteps[];
}): string[] => {
  const stillReferencedLogicFunctionIds = new Set([
    ...getCodeStepLogicFunctionIds(remainingWorkflowVersions),
    ...getLogicFunctionStepLogicFunctionIds(remainingWorkflowVersions),
  ]);

  return [
    ...new Set(getCodeStepLogicFunctionIds(deletedWorkflowVersions)),
  ].filter(
    (logicFunctionId) => !stillReferencedLogicFunctionIds.has(logicFunctionId),
  );
};
