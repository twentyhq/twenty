import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { type ExtractEntityRelatedSyncableEntityProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-entity-related-syncable-entity-properties.type';

export type ViewFilterEntityRelationProperties =
  ExtractEntityRelatedSyncableEntityProperties<ViewFilterEntity>;

export type FlatViewFilter = FlatEntityFrom<
  ViewFilterEntity,
  ViewFilterEntityRelationProperties
>;
