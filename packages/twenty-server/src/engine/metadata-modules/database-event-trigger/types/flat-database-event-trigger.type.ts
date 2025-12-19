import { type DatabaseEventTriggerEntity } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type ExtractEntityRelatedSyncableEntityProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-entity-related-syncable-entity-properties.type';

export type DatabaseEventTriggerEntityRelationProperties =
  ExtractEntityRelatedSyncableEntityProperties<
    DatabaseEventTriggerEntity
  >;

export type FlatDatabaseEventTrigger = FlatEntityFrom<
  DatabaseEventTriggerEntity,
  DatabaseEventTriggerEntityRelationProperties
>;
