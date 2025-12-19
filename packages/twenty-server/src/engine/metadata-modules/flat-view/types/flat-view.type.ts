import { type ExtractEntityRelatedSyncableEntityProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-related-syncable-entity-properties.type';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';

export type ViewEntityRelationProperties =
  ExtractEntityRelatedSyncableEntityProperties<ViewEntity>;

export type FlatView = FlatEntityFrom<ViewEntity>;
