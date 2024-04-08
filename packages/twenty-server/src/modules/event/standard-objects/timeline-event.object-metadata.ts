import { standardObjectIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { LogEventObjectMetadata } from 'src/modules/event/standard-objects/log-event.object-metadata';

@ObjectMetadata({
  standardId: standardObjectIds.event,
  namePlural: 'timelineEvents',
  labelSingular: 'Timeline Event',
  labelPlural: 'Timeline Events',
  description: 'Aggregated and/or filetered LogEvents',
  icon: 'IconTimelineEvent',
})
@IsSystem()
export class TimelineEventObjectMetadata extends LogEventObjectMetadata {}
