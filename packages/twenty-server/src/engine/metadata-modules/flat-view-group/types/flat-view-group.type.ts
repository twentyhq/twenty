import { type ExtractEntityRelatedSyncableEntityProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-related-syncable-entity-properties.type';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';

export type ViewGroupEntityRelationProperties =
  ExtractEntityRelatedSyncableEntityProperties<ViewGroupEntity>;

export type FlatViewGroup = FlatEntityFrom<
  ViewGroupEntity,
  ViewGroupEntityRelationProperties
>;
