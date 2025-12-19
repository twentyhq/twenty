import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { type ExtractEntityRelatedSyncableEntityProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-entity-related-syncable-entity-properties.type';

export type ViewEntityRelationProperties =
  ExtractEntityRelatedSyncableEntityProperties<ViewEntity>;

export type FlatView = FlatEntityFrom<
  ViewEntity,
  ViewEntityRelationProperties
> & {
  viewFieldIds: string[];
  viewFilterIds: string[];
  viewGroupIds: string[];
};
