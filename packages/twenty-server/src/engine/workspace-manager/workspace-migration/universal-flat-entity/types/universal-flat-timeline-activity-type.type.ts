import { type TimelineActivityTypeEntity } from 'src/engine/metadata-modules/timeline-activity-type/entities/timeline-activity-type.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatTimelineActivityType = UniversalFlatEntityFrom<
  TimelineActivityTypeEntity,
  'timelineActivityType'
>;
