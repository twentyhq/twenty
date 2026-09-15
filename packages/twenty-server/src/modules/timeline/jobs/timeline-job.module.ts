import { Module } from '@nestjs/common';

import { UpsertTimelineActivityFromInternalEvent } from 'src/modules/timeline/jobs/upsert-timeline-activity-from-internal-event.job';
import { TimelineActivityModule } from 'src/modules/timeline/timeline-activity.module';

@Module({
  imports: [TimelineActivityModule],
  providers: [UpsertTimelineActivityFromInternalEvent],
})
export class TimelineJobModule {}
