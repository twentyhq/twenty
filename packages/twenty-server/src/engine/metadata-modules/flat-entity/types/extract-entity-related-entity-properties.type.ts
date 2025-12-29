import { type ExtractEntityManyToOneEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-many-to-one-entity-relation-properties.type';
import { type ExtractEntityOneToManyEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-one-to-many-entity-relation-properties.type';

export type ExtractEntityRelatedEntityProperties<T> =
  | ExtractEntityManyToOneEntityRelationProperties<T>
  | ExtractEntityOneToManyEntityRelationProperties<T>;
