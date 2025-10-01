import { FLAT_DATABASE_EVENT_TRIGGER_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/database-event-trigger/constants/flat-database-event-trigger-editable-properties.constant';
import { type FlatDatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/types/flat-database-event-trigger.type';

export const FLAT_DATABASE_EVENT_TRIGGER_PROPERTIES_TO_COMPARE = [
  ...FLAT_DATABASE_EVENT_TRIGGER_EDITABLE_PROPERTIES,
] as const satisfies (keyof FlatDatabaseEventTrigger)[];
