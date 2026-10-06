import { type WorkspaceSignalName } from '@/application/constants/WorkspaceSignalNames';
import { type ServerRouteTriggerSettings } from '@/application/serverRouteTriggerSettingsType';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { type ToolTriggerSettings } from '@/application/toolTriggerSettingsType';
import { type WorkflowActionTriggerSettings } from '@/application/workflowActionTriggerSettingsType';
import { type DatabaseEventActorType } from '@/database-events/database-event-actor-type';
import { type HTTPMethod } from '@/types';

export type LogicFunctionManifest = SyncableEntityOptions & {
  name?: string;
  description?: string;
  timeoutSeconds?: number;
  cronTriggerSettings?: CronTriggerSettings;
  databaseEventTriggerSettings?: DatabaseEventTriggerSettings;
  httpRouteTriggerSettings?: HttpRouteTriggerSettings;
  serverRouteTriggerSettings?: ServerRouteTriggerSettings;
  toolTriggerSettings?: ToolTriggerSettings;
  workflowActionTriggerSettings?: WorkflowActionTriggerSettings;
  sourceHandlerPath: string;
  builtHandlerPath: string;
  builtHandlerChecksum: string;
  handlerName: string;
};

export type CronTriggerSettings = {
  pattern: string;
};

export type DatabaseEventTriggerRecordConditionOperand = {
  eq?: unknown;
  neq?: unknown;
  in?: unknown[];
  is?: 'NULL' | 'NOT_NULL';
  gt?: string | number;
  gte?: string | number;
  lt?: string | number;
  lte?: string | number;
  like?: string;
  ilike?: string;
  startsWith?: string;
};

// Same grammar as a records API filter: field names map to an operand, or to a
// nested condition for composite fields; and, or and not combine conditions.
export type DatabaseEventTriggerRecordCondition = {
  and?: DatabaseEventTriggerRecordCondition[];
  or?: DatabaseEventTriggerRecordCondition[];
  not?: DatabaseEventTriggerRecordCondition;
} & {
  [fieldName: string]:
    | DatabaseEventTriggerRecordConditionOperand
    | DatabaseEventTriggerRecordCondition
    | DatabaseEventTriggerRecordCondition[]
    | undefined;
};

export type DatabaseEventTriggerOnMismatch = 'drop' | 'deferUntilMatch';

export type DatabaseEventTriggerConditions = {
  // Who performed the write. A batch carries one actor, so one check per batch.
  actor?: DatabaseEventActorType[];
  // Evaluated per event on the record after the write, before it for deleted
  // and destroyed events.
  record?: DatabaseEventTriggerRecordCondition;
  // Evaluated per batch against the workspace signals current at delivery.
  signals?: Partial<Record<WorkspaceSignalName, boolean>>;
  // Applies to signal mismatches only; record and actor mismatches always drop.
  onMismatch?: DatabaseEventTriggerOnMismatch;
};

export type DatabaseEventTriggerSettings = {
  eventName: string;
  updatedFields?: string[];
  batchMode?: boolean;
  conditions?: DatabaseEventTriggerConditions;
};

export type HttpRouteTriggerSettings = {
  path: string;
  httpMethod: HTTPMethod;
  isAuthRequired: boolean;
  forwardedRequestHeaders?: string[];
};
