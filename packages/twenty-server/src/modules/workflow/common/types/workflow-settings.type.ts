import { WorkflowSystemActionType } from 'src/modules/workflow/common/types/workflow-system-action.type';

type BaseWorkflowSettings = {
  errorHandlingOptions: {
    retryOnFailure: {
      value: boolean;
    };
    continueOnFailure: {
      value: boolean;
    };
  };
};

export type WorkflowCodeSettings = BaseWorkflowSettings & {
  serverlessFunctionId: string;
};

export type WorkflowSystemActionSettings = BaseWorkflowSettings & {
  systemActionType: WorkflowSystemActionType;
};
