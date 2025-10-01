export type BaseDatabaseEventTriggerSettings = {
  eventName: string;
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
