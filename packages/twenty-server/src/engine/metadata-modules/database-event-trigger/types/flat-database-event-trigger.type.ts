import { type DatabaseEventTriggerEntity } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';

export type FlatDatabaseEventTrigger =
  FlatEntityFrom<DatabaseEventTriggerEntity>;
