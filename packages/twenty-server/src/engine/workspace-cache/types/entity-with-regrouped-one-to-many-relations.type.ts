import { type ExtractEntityOneToManyEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-one-to-many-entity-relation-properties.type';
import { type RegroupedEntity } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';
import { type SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

export type EntityWithRegroupedOneToManyRelations<
  TEntity extends SyncableEntity,
> = Omit<
  TEntity,
  ExtractEntityOneToManyEntityRelationProperties<TEntity, SyncableEntity>
> & {
  [P in ExtractEntityOneToManyEntityRelationProperties<
    TEntity,
    SyncableEntity
  >]: RegroupedEntity[];
};
