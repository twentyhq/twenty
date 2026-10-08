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

type StepWithLogicFunction = {
  settings: { input: { logicFunctionId?: string } };
};

const getSteps = (workflowVersions: WorkflowVersionSteps[]) =>
  workflowVersions.flatMap(({ steps }) => steps ?? []);

const getLogicFunctionIds = (steps: StepWithLogicFunction[]): string[] =>
  steps
    .map((step) => step.settings.input.logicFunctionId)
    .filter(isLogicFunctionId);

export const getExclusivelyOwnedCodeStepLogicFunctionIds = ({
  deletedWorkflowVersions,
  remainingWorkflowVersions,
}: {
  deletedWorkflowVersions: WorkflowVersionSteps[];
  remainingWorkflowVersions: WorkflowVersionSteps[];
}): string[] => {
  const remainingSteps = getSteps(remainingWorkflowVersions);
  const stillReferencedLogicFunctionIds = new Set(
    getLogicFunctionIds([
      ...remainingSteps.filter(isWorkflowCodeAction),
      ...remainingSteps.filter(isWorkflowLogicFunctionAction),
    ]),
  );

  return [
    ...new Set(
      getLogicFunctionIds(
        getSteps(deletedWorkflowVersions).filter(isWorkflowCodeAction),
      ),
    ),
  ].filter(
    (logicFunctionId) => !stillReferencedLogicFunctionIds.has(logicFunctionId),
  );
};
