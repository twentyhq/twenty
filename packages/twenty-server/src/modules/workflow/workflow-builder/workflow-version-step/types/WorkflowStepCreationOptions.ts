import { type WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

type WorkflowIteratorStepCreationOptions = {
  type: WorkflowActionType.ITERATOR;
  settings: {
    iteratorStepId: string;
    shouldInsertToLoop: boolean;
  };
};

export type WorkflowStepCreationOptions = WorkflowIteratorStepCreationOptions;
