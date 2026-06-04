import { type BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

export const BASE_STEP_DEFINITION: BaseWorkflowActionSettings = {
  outputSchema: {},
  errorHandlingOptions: {
    continueOnFailure: {
      value: false,
    },
    retryOnFailure: {
      value: false,
    },
  },
};

export const DUPLICATED_STEP_POSITION_OFFSET = 50;

export const ITERATOR_EMPTY_STEP_POSITION_OFFSET = {
  x: 174,
  y: 83,
};
