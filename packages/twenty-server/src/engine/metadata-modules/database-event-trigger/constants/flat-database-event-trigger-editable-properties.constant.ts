import { type FlatDatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/types/flat-database-event-trigger.type';

export const FLAT_DATABASE_EVENT_TRIGGER_EDITABLE_PROPERTIES = [
  'settings',
] as const satisfies (keyof FlatDatabaseEventTrigger)[];
