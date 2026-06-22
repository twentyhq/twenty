import { type StepFilter, type StepFilterGroup } from 'twenty-shared/types';

export type DatabaseEventTriggerFilterSettings = {
  stepFilters: StepFilter[];
  stepFilterGroups: StepFilterGroup[];
};

export type BaseDatabaseEventTriggerSettings = {
  eventName: string;
  filter?: DatabaseEventTriggerFilterSettings;
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
