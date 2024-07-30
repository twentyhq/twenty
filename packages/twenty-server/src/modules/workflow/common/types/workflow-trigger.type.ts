import { WorkflowAction } from 'src/modules/workflow/common/types/workflow-action.type';

export enum WorkflowTriggerType {
  DATABASE_EVENT = 'DATABASE_EVENT',
}

export type WorkflowDatabaseEventTrigger = {
  type: WorkflowTriggerType.DATABASE_EVENT;
  input?: object;
  settings: {
    eventName: string;
    triggerName: string;
  };
  nextAction?: WorkflowAction;
};

export type WorkflowTrigger = WorkflowDatabaseEventTrigger;
