import { type WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

type WorkflowIteratorStepConnectionOptions = {
  connectedStepType: WorkflowActionType.ITERATOR;
  settings: {
    isConnectedToLoop: boolean;
  };
};

export type WorkflowStepConnectionOptions =
  WorkflowIteratorStepConnectionOptions;
