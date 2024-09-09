import { WorkflowCodeSettings } from 'src/modules/workflow/common/types/settings/workflow-code-settings.type';
import { WorkflowSystemActionSettings } from 'src/modules/workflow/common/types/settings/workflow-system-action-settings.type';

export enum WorkflowStepType {
  CODE_ACTION = 'CODE_ACTION',
  SYSTEM_ACTION = 'SYSTEM_ACTION',
}

type BaseWorkflowStep = {
  id: string;
  name: string;
  valid: boolean;
};

export type WorkflowCodeStep = BaseWorkflowStep & {
  type: WorkflowStepType.CODE_ACTION;
  settings: WorkflowCodeSettings;
};

export type WorkflowSystemStep = BaseWorkflowStep & {
  type: WorkflowStepType.SYSTEM_ACTION;
  settings: WorkflowSystemActionSettings;
};

export type WorkflowStep = WorkflowCodeStep | WorkflowSystemStep;
