import { Module } from '@nestjs/common';

import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { UpsertTimelineActivityFromInternalEvent } from 'src/modules/timeline/jobs/upsert-timeline-activity-from-internal-event.job';
import { TimelineActivityModule } from 'src/modules/timeline/timeline-activity.module';

@Module({
  imports: [TimelineActivityModule, TwentyORMModule],
  providers: [UpsertTimelineActivityFromInternalEvent],
})
export class TimelineJobModule {}
