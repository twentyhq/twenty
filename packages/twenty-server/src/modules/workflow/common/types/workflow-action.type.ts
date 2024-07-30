import { WorkflowSettingsType } from 'src/modules/workflow/common/types/workflow-settings.type';

export enum WorkflowActionType {
  CODE = 'CODE',
}

export type WorkflowAction = {
  name: string;
  displayName: string;
  type: WorkflowActionType;
  valid: boolean;
  settings: WorkflowSettingsType;
  nextAction?: WorkflowAction;
};
