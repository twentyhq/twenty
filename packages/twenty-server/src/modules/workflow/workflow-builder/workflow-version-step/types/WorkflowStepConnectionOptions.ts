import { type WorkflowActionType } from 'twenty-shared/workflow';

type WorkflowIteratorStepConnectionOptions = {
  connectedStepType: WorkflowActionType.ITERATOR;
  settings: {
    isConnectedToLoop: boolean;
  };
};

type WorkflowIfElseStepConnectionOptions = {
  connectedStepType: WorkflowActionType.IF_ELSE;
  settings: {
    branchId: string;
  };
};

export type WorkflowStepConnectionOptions =
  | WorkflowIteratorStepConnectionOptions
  | WorkflowIfElseStepConnectionOptions;
