import { type ExtractEntityRelatedSyncableEntityProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-related-syncable-entity-properties.type';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';

export type ViewFilterEntityRelationProperties =
  ExtractEntityRelatedSyncableEntityProperties<ViewFilterEntity>;

export type FlatViewFilter = FlatEntityFrom<
  ViewFilterEntity,
  ViewFilterEntityRelationProperties
>;
