export enum WorkflowStepType {
  CODE_ACTION = 'CODE_ACTION',
  SEND_EMAIL_ACTION = 'SEND_EMAIL_ACTION',
}

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

type BaseWorkflowStep = {
  id: string;
  name: string;
  valid: boolean;
};

export type WorkflowCodeStep = BaseWorkflowStep & {
  type: WorkflowStepType.CODE_ACTION;
  settings: BaseWorkflowSettings & {
    serverlessFunctionId: string;
  };
};

export type WorkflowSendEmailStep = BaseWorkflowStep & {
  type: WorkflowStepType.SEND_EMAIL_ACTION;
  settings: BaseWorkflowSettings & {
    subject?: string;
    template?: string;
    title?: string;
    callToAction?: {
      value: string;
      href: string;
    };
  };
};

export type WorkflowStep = WorkflowCodeStep | WorkflowSendEmailStep;
