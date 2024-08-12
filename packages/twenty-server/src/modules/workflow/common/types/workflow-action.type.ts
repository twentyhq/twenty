import { WorkflowCodeSettingsType } from 'src/modules/workflow/common/types/workflow-settings.type';

export enum WorkflowActionType {
  CODE = 'CODE',
}

type CommonWorkflowAction = {
  name: string;
  displayName: string;
  valid: boolean;
};

type WorkflowCodeAction = CommonWorkflowAction & {
  type: WorkflowActionType.CODE;
  settings: WorkflowCodeSettingsType;
};

export type WorkflowAction = WorkflowCodeAction & {
  nextAction: WorkflowAction;
};
