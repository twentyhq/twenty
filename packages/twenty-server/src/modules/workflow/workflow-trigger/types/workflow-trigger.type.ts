import {
  type BulkRecordsAvailability,
  type GlobalAvailability,
  type SingleRecordAvailability,
} from 'twenty-shared/workflow';

import { type OutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';

export enum WorkflowTriggerType {
  DATABASE_EVENT = 'DATABASE_EVENT',
  MANUAL = 'MANUAL',
  CRON = 'CRON',
  WEBHOOK = 'WEBHOOK',
}

type BaseWorkflowTriggerSettings = {
  outputSchema: OutputSchema;
};

type BaseTrigger = {
  name: string;
  type: WorkflowTriggerType;
  settings: BaseWorkflowTriggerSettings;
  nextStepIds?: string[];
  position?: {
    x: number;
    y: number;
  };
};

export type WorkflowDatabaseEventTrigger = BaseTrigger & {
  type: WorkflowTriggerType.DATABASE_EVENT;
  settings: BaseWorkflowTriggerSettings & {
    eventName: string;
  };
};

export type WorkflowManualTrigger = BaseTrigger & {
  type: WorkflowTriggerType.MANUAL;
  settings: BaseWorkflowTriggerSettings & {
    objectType?: string;
    icon?: string;
    availability?:
      | GlobalAvailability
      | SingleRecordAvailability
      | BulkRecordsAvailability;
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

export type WorkflowTrigger =
  | WorkflowDatabaseEventTrigger
  | WorkflowManualTrigger
  | WorkflowCronTrigger
  | WorkflowWebhookTrigger;
