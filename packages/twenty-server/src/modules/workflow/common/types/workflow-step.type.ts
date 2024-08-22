import { WorkflowCodeSettings } from 'src/modules/workflow/common/types/workflow-settings.type';

export enum WorkflowStepType {
  CODE = 'CODE',
}

type BaseWorkflowStep = {
  id: string;
  name: string;
  valid: boolean;
};

export type WorkflowCodeStep = BaseWorkflowStep & {
  type: WorkflowStepType.CODE;
  settings: WorkflowCodeSettings;
};

export type WorkflowStep = WorkflowCodeStep;
