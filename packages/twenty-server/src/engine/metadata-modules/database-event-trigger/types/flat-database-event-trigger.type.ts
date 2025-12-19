import { type DatabaseEventTriggerEntity } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';
import { type ExtractEntityRelatedSyncableEntityProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-related-syncable-entity-properties.type';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';

export type DatabaseEventTriggerEntityRelationProperties =
  ExtractEntityRelatedSyncableEntityProperties<
    DatabaseEventTriggerEntity
  >;

export type FlatDatabaseEventTrigger = FlatEntityFrom<
  DatabaseEventTriggerEntity,
  DatabaseEventTriggerEntityRelationProperties
>;
