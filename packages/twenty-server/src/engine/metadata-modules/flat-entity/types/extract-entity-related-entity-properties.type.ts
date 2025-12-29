import { type AllMetadataName } from 'twenty-shared/metadata';

import { type ExtractEntityManyToOneEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-many-to-one-entity-relation-properties.type';
import { type ExtractEntityOneToManyEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-one-to-many-entity-relation-properties.type';
import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { type AllNonSyncableEntity } from 'src/engine/workspace-manager/workspace-sync/types/all-non-syncable-entities.type';

export type ExtractEntityRelatedEntityProperties<
  T,
  TTarget = MetadataEntity<AllMetadataName> | AllNonSyncableEntity,
> =
  | ExtractEntityManyToOneEntityRelationProperties<T, TTarget>
  | ExtractEntityOneToManyEntityRelationProperties<T, TTarget>;
