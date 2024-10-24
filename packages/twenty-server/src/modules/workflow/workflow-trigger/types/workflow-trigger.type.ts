import { OutputSchema } from 'src/modules/workflow/workflow-executor/types/workflow-step-settings.type';

export enum WorkflowTriggerType {
  DATABASE_EVENT = 'DATABASE_EVENT',
}

type BaseWorkflowTriggerSettings = {
  input?: object;
  outputSchema: OutputSchema;
};

type BaseTrigger = {
  name: string;
  type: WorkflowTriggerType;
  settings: BaseWorkflowTriggerSettings;
};

export type WorkflowDatabaseEventTrigger = BaseTrigger & {
  type: WorkflowTriggerType.DATABASE_EVENT;
  settings: {
    eventName: string;
  };
};

export type WorkflowTrigger = WorkflowDatabaseEventTrigger;
