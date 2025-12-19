import { ExtractEntityManyToOneSyncableEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-many-to-one-syncable-entity-relation-properties.type';
import { ExtractEntityOneToManySyncableEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-one-to-many-syncabl-entity-relation-properties.type';

export type ExtractEntityRelatedSyncableEntityProperties<
  T,
> =
  | ExtractEntityManyToOneSyncableEntityRelationProperties<T>
  | ExtractEntityOneToManySyncableEntityRelationProperties<T>;


