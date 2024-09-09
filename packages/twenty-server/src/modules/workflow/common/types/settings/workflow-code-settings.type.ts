import { BaseWorkflowSettings } from 'src/modules/workflow/common/types/settings/workflow-base-settings.type';

export type WorkflowCodeSettings = BaseWorkflowSettings & {
  serverlessFunctionId: string;
};
