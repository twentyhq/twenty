import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type RouteTriggerEntity } from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';
import { type ExtractEntityRelatedSyncableEntityProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-entity-related-syncable-entity-properties.type';

export type RouteTriggerEntityRelationProperties =
  ExtractEntityRelatedSyncableEntityProperties<
    RouteTriggerEntity
  >;

export type FlatRouteTrigger = FlatEntityFrom<
  RouteTriggerEntity,
  RouteTriggerEntityRelationProperties
>;
