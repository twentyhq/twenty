import { ExtractEntityManyToOneRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-many-to-one-relation-properties.type';
import { ExtractEntityOneToManyRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-one-to-many-relation-properties.type';

export type ExtractEntityRelatedSyncableEntityProperties<
  T,
> =
  | ExtractEntityManyToOneRelationProperties<T>
  | ExtractEntityOneToManyRelationProperties<T>;


