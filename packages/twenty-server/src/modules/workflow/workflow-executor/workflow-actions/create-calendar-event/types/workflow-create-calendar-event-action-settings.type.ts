import { type BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

import { type WorkflowCreateCalendarEventActionInput } from './workflow-create-calendar-event-action-input.type';

export type WorkflowCreateCalendarEventActionSettings =
  BaseWorkflowActionSettings & {
    input: WorkflowCreateCalendarEventActionInput;
  };
