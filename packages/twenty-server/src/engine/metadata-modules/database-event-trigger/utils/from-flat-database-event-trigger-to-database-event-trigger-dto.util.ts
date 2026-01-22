import { type DatabaseEventTriggerDTO } from 'src/engine/metadata-modules/database-event-trigger/dtos/database-event-trigger.dto';
import { type FlatDatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/types/flat-database-event-trigger.type';

export const fromFlatDatabaseEventTriggerToDatabaseEventTriggerDto = (
  flatDatabaseEventTrigger: FlatDatabaseEventTrigger,
): DatabaseEventTriggerDTO => ({
  id: flatDatabaseEventTrigger.id,
  settings: flatDatabaseEventTrigger.settings,
  createdAt: new Date(flatDatabaseEventTrigger.createdAt),
  updatedAt: new Date(flatDatabaseEventTrigger.updatedAt),
});
