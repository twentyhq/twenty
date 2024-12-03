import { OutputSchema } from 'src/modules/workflow/workflow-builder/types/output-schema.type';

export enum WorkflowTriggerType {
  DATABASE_EVENT = 'DATABASE_EVENT',
  MANUAL = 'MANUAL',
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

export type WorkflowManualTriggerSettings = WorkflowManualTrigger['settings'];

export type WorkflowTrigger =
  | WorkflowDatabaseEventTrigger
  | WorkflowManualTrigger;
