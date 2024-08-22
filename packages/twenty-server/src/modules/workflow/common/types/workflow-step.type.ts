import { WorkflowCodeSettings } from 'src/modules/workflow/common/types/workflow-settings.type';

export enum WorkflowStepType {
  CODE_ACTION = 'CODE_ACTION',
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

export type WorkflowStep = WorkflowCodeStep;
