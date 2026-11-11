import { type CronTriggerSettings } from 'twenty-shared/application';
import { type StepFilter, type StepFilterGroup } from 'twenty-shared/types';

export type DatabaseEventTriggerFilterSettings = {
  stepFilters: StepFilter[];
  stepFilterGroups: StepFilterGroup[];
};

export type BaseDatabaseEventTriggerSettings = {
  eventName: string;
  condition?: string;
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

export type AutomatedTriggerSettings =
  | DatabaseEventTriggerSettings
  | CronTriggerSettings;
