import {
  WorkflowCodeStepSettings,
  WorkflowSendEmailStepSettings,
} from 'src/modules/workflow/workflow-executor/types/workflow-step-settings.type';

export enum WorkflowStepType {
  CODE_ACTION = 'CODE_ACTION',
  SEND_EMAIL_ACTION = 'SEND_EMAIL_ACTION',
}

type BaseWorkflowStep = {
  id: string;
  name: string;
  valid: boolean;
};

export type WorkflowCodeStep = BaseWorkflowStep & {
  type: WorkflowStepType.CODE_ACTION;
  settings: WorkflowCodeStepSettings;
};

export type WorkflowSendEmailStep = BaseWorkflowStep & {
  type: WorkflowStepType.SEND_EMAIL_ACTION;
  settings: WorkflowSendEmailStepSettings;
};

export type WorkflowStep = WorkflowCodeStep | WorkflowSendEmailStep;
