import { type WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

type WorkflowIteratorStepCreationOptions = {
  parentStepType: WorkflowActionType.ITERATOR;
  settings: {
    shouldInsertToLoop: boolean;
  };
};

export type WorkflowStepCreationOptions = WorkflowIteratorStepCreationOptions;
