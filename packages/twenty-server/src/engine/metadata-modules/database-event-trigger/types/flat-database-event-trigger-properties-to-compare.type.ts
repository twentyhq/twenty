import { type FLAT_DATABASE_EVENT_TRIGGER_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/database-event-trigger/constants/flat-database-event-trigger-properties-to-compare.constant';

export type FlatDatabaseEventTriggerPropertiesToCompare =
  (typeof FLAT_DATABASE_EVENT_TRIGGER_PROPERTIES_TO_COMPARE)[number];
