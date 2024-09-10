import { BaseWorkflowSettings } from 'src/modules/workflow/common/types/settings/workflow-base-settings.type';
import { WorkflowSystemActionType } from 'src/modules/workflow/common/types/workflow-system-action.type';

type BaseSystemActionSettings = BaseWorkflowSettings & {
  systemActionType: WorkflowSystemActionType;
};

export type WorkflowSystemSendEmailActionSettings = BaseSystemActionSettings & {
  subject?: string;
  template?: string;
  title?: string;
  callToAction?: {
    value: string;
    href: string;
  };
};

export type WorkflowSystemActionSettings =
  WorkflowSystemSendEmailActionSettings;
