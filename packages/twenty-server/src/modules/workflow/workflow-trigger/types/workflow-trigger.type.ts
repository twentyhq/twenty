export enum WorkflowTriggerType {
  DATABASE_EVENT = 'DATABASE_EVENT',
}

type BaseTrigger = {
  name: string;
  type: WorkflowTriggerType;
  input?: object;
};

export type WorkflowDatabaseEventTrigger = BaseTrigger & {
  type: WorkflowTriggerType.DATABASE_EVENT;
  settings: {
    eventName: string;
  };
};

export type WorkflowTrigger = WorkflowDatabaseEventTrigger;
