import { isNonEmptyString } from '@sniptt/guards';

import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import { WorkflowActionType } from 'twenty-shared/workflow';
import { type WorkflowCodeActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/code/types/workflow-code-action-input.type';
import {
  type WorkflowAction,
  type WorkflowCodeAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export type CodeStepForLogicFunctionIdExtraction = Pick<
  WorkflowCodeAction,
  'id' | 'type'
> & {
  settings: {
    input: Pick<WorkflowCodeActionInput, 'logicFunctionId'>;
  };
};

export type NonCodeStepForLogicFunctionIdExtraction = Pick<
  Exclude<WorkflowAction, WorkflowCodeAction>,
  'id' | 'type'
>;

type WorkflowStepForLogicFunctionIdExtraction =
  | CodeStepForLogicFunctionIdExtraction
  | NonCodeStepForLogicFunctionIdExtraction;

const isCodeStepForLogicFunction = (
  step: WorkflowStepForLogicFunctionIdExtraction,
): step is CodeStepForLogicFunctionIdExtraction =>
  step.type === WorkflowActionType.CODE;

export const extractCodeStepLogicFunctionIdsFromWorkflowSteps = (
  steps: WorkflowStepForLogicFunctionIdExtraction[],
): string[] => [
  ...new Set(
    steps.filter(isCodeStepForLogicFunction).map((step) => {
      const logicFunctionId = step.settings.input.logicFunctionId;

      if (!isNonEmptyString(logicFunctionId)) {
        throw new WorkflowVersionStepException(
          `CODE step '${step.id}' has no logic function id`,
          WorkflowVersionStepExceptionCode.INVALID_REQUEST,
        );
      }

      return logicFunctionId;
    }),
  ),
];
