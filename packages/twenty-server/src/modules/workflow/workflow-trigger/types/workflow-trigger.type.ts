import { OutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';

export enum WorkflowTriggerType {
  DATABASE_EVENT = 'DATABASE_EVENT',
  MANUAL = 'MANUAL',
  CRON = 'CRON',
  WEBHOOK = 'WEBHOOK',
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
  settings: BaseWorkflowTriggerSettings & {
    eventName: string;
  };
};

export enum WorkflowManualTriggerAvailability {
  EVERYWHERE = 'EVERYWHERE',
  WHEN_RECORD_SELECTED = 'WHEN_RECORD_SELECTED',
}

export type WorkflowManualTrigger = BaseTrigger & {
  type: WorkflowTriggerType.MANUAL;
  settings: BaseWorkflowTriggerSettings & {
    objectType?: string;
    icon?: string;
  };
};

export type WorkflowCronTrigger = BaseTrigger & {
  type: WorkflowTriggerType.CRON;
  settings: BaseWorkflowTriggerSettings &
    (
      | {
          type: 'DAYS';
          schedule: { day: number; hour: number; minute: number };
        }
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
    );
};

export type WorkflowWebhookTrigger = BaseTrigger & {
  type: WorkflowTriggerType.WEBHOOK;
  settings: BaseWorkflowTriggerSettings &
    (
      | {
          httpMethod: 'GET';
          authentication: 'API_KEY' | null;
        }
      | {
          httpMethod: 'POST';
          authentication: 'API_KEY' | null;
          expectedBody: object;
        }
    );
};

export type WorkflowManualTriggerSettings = WorkflowManualTrigger['settings'];

export type WorkflowTrigger =
  | WorkflowDatabaseEventTrigger
  | WorkflowManualTrigger
  | WorkflowCronTrigger
  | WorkflowWebhookTrigger;
