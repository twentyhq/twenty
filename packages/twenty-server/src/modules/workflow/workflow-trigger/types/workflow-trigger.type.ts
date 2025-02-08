import { OutputSchema } from 'src/modules/workflow/workflow-builder/types/output-schema.type';

export enum WorkflowTriggerType {
  DATABASE_EVENT = 'DATABASE_EVENT',
  MANUAL = 'MANUAL',
  CRON = 'CRON',
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

export enum WorkflowManualTriggerAvailability {
  EVERYWHERE = 'EVERYWHERE',
  WHEN_RECORD_SELECTED = 'WHEN_RECORD_SELECTED',
}

export type WorkflowManualTrigger = BaseTrigger & {
  type: WorkflowTriggerType.MANUAL;
  settings: {
    objectType?: string;
  };
};

export type WorkflowCronTrigger = BaseTrigger & {
  type: WorkflowTriggerType.CRON;
  settings: (
    | {
        type: 'HOURS';
        schedule: { hour: number; minute: number };
      }
    | {
        type: 'MINUTES';
        schedule: { minute: number };
      }
    | {
        type: 'CUSTOM';
        pattern: string;
      }
  ) & { outputSchema: object };
};

export type WorkflowManualTriggerSettings = WorkflowManualTrigger['settings'];

export type WorkflowTrigger =
  | WorkflowDatabaseEventTrigger
  | WorkflowManualTrigger
  | WorkflowCronTrigger;
