import {
  WorkflowCodeStepSettings,
  WorkflowCreateRecordStepSettings,
  WorkflowSendEmailStepSettings,
  WorkflowStepSettings,
} from 'src/modules/workflow/workflow-executor/types/workflow-step-settings.type';

export enum WorkflowActionType {
  CODE = 'CODE',
  SEND_EMAIL = 'SEND_EMAIL',
  CREATE_RECORD = 'CREATE_RECORD',
}

type BaseWorkflowStep = {
  id: string;
  name: string;
  type: WorkflowActionType;
  settings: WorkflowStepSettings;
  valid: boolean;
};

export type WorkflowCodeStep = BaseWorkflowStep & {
  type: WorkflowActionType.CODE;
  settings: WorkflowCodeStepSettings;
};

export type WorkflowSendEmailStep = BaseWorkflowStep & {
  type: WorkflowActionType.SEND_EMAIL;
  settings: WorkflowSendEmailStepSettings;
};

export type WorkflowCreateRecordStep = BaseWorkflowStep & {
  type: WorkflowActionType.CREATE_RECORD;
  settings: WorkflowCreateRecordStepSettings;
};

export type WorkflowStep =
  | WorkflowCodeStep
  | WorkflowSendEmailStep
  | WorkflowCreateRecordStep;
