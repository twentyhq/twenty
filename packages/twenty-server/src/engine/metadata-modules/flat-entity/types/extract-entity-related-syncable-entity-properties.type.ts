import { ExtractEntityManyToOneRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-many-to-one-relation-properties.type';
import { ExtractEntityOneToManyRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-one-to-many-relation-properties.type';
import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/interfaces/syncable-entity.interface';

export type ExtractEntityRelatedSyncableEntityProperties<
  T extends SyncableEntity,
> =
  | ExtractEntityManyToOneRelationProperties<T>
  | ExtractEntityOneToManyRelationProperties<T>;


