import { type StepFilter, type StepFilterGroup } from 'twenty-shared/types';

import { type OutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';

export type DatabaseEventTriggerFilterSettings = {
  stepFilters: StepFilter[];
  stepFilterGroups: StepFilterGroup[];
};

export type BaseDatabaseEventTriggerSettings = {
  eventName: string;
  filter?: DatabaseEventTriggerFilterSettings;
  outputSchema?: OutputSchema;
};

export type DatabaseEventTriggerSettings =
  | BaseDatabaseEventTriggerSettings
  | UpdateEventTriggerSettings
  | UpsertEventTriggerSettings;

export type UpdateEventTriggerSettings = BaseDatabaseEventTriggerSettings & {
  fields: string[];
};

export type UpsertEventTriggerSettings = BaseDatabaseEventTriggerSettings & {
  fields: string[];
};

export type CronTriggerSettings = {
  pattern: string;
};

export type AutomatedTriggerSettings =
  | DatabaseEventTriggerSettings
  | CronTriggerSettings;
