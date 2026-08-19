import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type TimelineActivityRuleEntity } from 'src/engine/metadata-modules/timeline-activity-rule/entities/timeline-activity-rule.entity';

export type FlatTimelineActivityRule =
  FlatEntityFrom<TimelineActivityRuleEntity>;
