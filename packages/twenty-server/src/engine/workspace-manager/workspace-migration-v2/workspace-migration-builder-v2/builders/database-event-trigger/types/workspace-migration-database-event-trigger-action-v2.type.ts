import { type FlatDatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/types/flat-database-event-trigger.type';
import { type FlatEntityPropertiesUpdates } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';

export type CreateDatabaseEventTriggerAction = {
  type: 'create_database_event_trigger';
  databaseEventTrigger: FlatDatabaseEventTrigger;
};

export type UpdateDatabaseEventTriggerAction = {
  type: 'update_database_event_trigger';
  databaseEventTriggerId: string;
  updates: FlatEntityPropertiesUpdates<'databaseEventTrigger'>;
};

export type DeleteDatabaseEventTriggerAction = {
  type: 'delete_database_event_trigger';
  databaseEventTriggerId: string;
};

export type WorkspaceMigrationDatabaseEventTriggerActionV2 =
  | CreateDatabaseEventTriggerAction
  | UpdateDatabaseEventTriggerAction
  | DeleteDatabaseEventTriggerAction;
