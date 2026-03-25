import { type StepIfElseBranch } from 'twenty-shared/workflow';

import { type WorkflowCodeActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/code/types/workflow-code-action-settings.type';
import { type WorkflowIfElseActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/types/workflow-if-else-action-settings.type';
import { type WorkflowIteratorActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/types/workflow-iterator-action-settings.type';
import {
  WorkflowActionType,
  type WorkflowCodeAction,
  type WorkflowIfElseAction,
  type WorkflowIteratorAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const createMockCodeStep = (
  id: string,
  nextStepIds: string[] = [],
): WorkflowCodeAction => ({
  id,
  name: `Step ${id}`,
  type: WorkflowActionType.CODE,
  valid: true,
  nextStepIds,
  settings: {
    input: {},
    outputSchema: {},
    errorHandlingOptions: {
      continueOnFailure: { value: false },
      retryOnFailure: { value: false },
    },
  } as WorkflowCodeActionSettings,
});

export const createMockIteratorStep = (
  id: string,
  nextStepIds: string[] = [],
  initialLoopStepIds: string[] = [],
  shouldContinueOnIterationFailure = false,
): WorkflowIteratorAction => ({
  id,
  name: `Iterator ${id}`,
  type: WorkflowActionType.ITERATOR,
  valid: true,
  nextStepIds,
  settings: {
    input: {
      initialLoopStepIds,
      shouldContinueOnIterationFailure,
    } as WorkflowIteratorActionInput,
    outputSchema: {},
    errorHandlingOptions: {
      continueOnFailure: { value: false },
      retryOnFailure: { value: false },
    },
  },
});

export const createMockIfElseStep = (
  id: string,
  branches: StepIfElseBranch[],
  nextStepIds: string[] = [],
): WorkflowIfElseAction => ({
  id,
  name: `Step ${id}`,
  type: WorkflowActionType.IF_ELSE,
  valid: true,
  nextStepIds,
  settings: {
    input: {
      stepFilterGroups: [],
      stepFilters: [],
      branches,
    },
    outputSchema: {},
    errorHandlingOptions: {
      continueOnFailure: { value: false },
      retryOnFailure: { value: false },
    },
  } as WorkflowIfElseActionSettings,
});
