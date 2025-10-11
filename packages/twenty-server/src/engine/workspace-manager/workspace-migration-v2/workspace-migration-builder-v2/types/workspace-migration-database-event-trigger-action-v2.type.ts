import { type FlatDatabaseEventTriggerPropertiesToCompare } from 'src/engine/metadata-modules/database-event-trigger/types/flat-database-event-trigger-properties-to-compare.type';
import { type FlatDatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/types/flat-database-event-trigger.type';
import { type PropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/types/property-update.type';

export type CreateDatabaseEventTriggerAction = {
  type: 'create_database_event_trigger';
  databaseEventTrigger: FlatDatabaseEventTrigger;
};

export type UpdateDatabaseEventTriggerAction = {
  type: 'update_database_event_trigger';
  databaseEventTriggerId: string;
  updates: Array<
    {
      [P in FlatDatabaseEventTriggerPropertiesToCompare]: PropertyUpdate<
        FlatDatabaseEventTrigger,
        P
      >;
    }[FlatDatabaseEventTriggerPropertiesToCompare]
  >;
};

export type DeleteDatabaseEventTriggerAction = {
  type: 'delete_database_event_trigger';
  databaseEventTriggerId: string;
};

export type WorkspaceMigrationDatabaseEventTriggerActionV2 =
  | CreateDatabaseEventTriggerAction
  | UpdateDatabaseEventTriggerAction
  | DeleteDatabaseEventTriggerAction;
