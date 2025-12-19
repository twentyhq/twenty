import { type CronTriggerEntity } from 'src/engine/metadata-modules/cron-trigger/entities/cron-trigger.entity';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type ExtractEntityRelatedSyncableEntityProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-entity-related-syncable-entity-properties.type';

export type CronTriggerEntityRelationProperties =
  ExtractEntityRelatedSyncableEntityProperties<
    CronTriggerEntity
  >;

export type FlatCronTrigger = FlatEntityFrom<
  CronTriggerEntity,
  CronTriggerEntityRelationProperties
>;
