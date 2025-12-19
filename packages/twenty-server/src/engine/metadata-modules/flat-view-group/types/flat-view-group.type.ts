import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { type ExtractEntityRelatedSyncableEntityProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-entity-related-syncable-entity-properties.type';

export type ViewGroupEntityRelationProperties =
  ExtractEntityRelatedSyncableEntityProperties<ViewGroupEntity>;

export type FlatViewGroup = FlatEntityFrom<
  ViewGroupEntity,
  ViewGroupEntityRelationProperties
>;
