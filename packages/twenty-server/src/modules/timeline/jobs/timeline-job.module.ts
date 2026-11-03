import { Module } from '@nestjs/common';

import { DeleteTimelineActivitiesOfDestroyedLinkedRecordsJob } from 'src/modules/timeline/jobs/delete-timeline-activities-of-destroyed-linked-records.job';
import { UpsertTimelineActivityFromInternalEvent } from 'src/modules/timeline/jobs/upsert-timeline-activity-from-internal-event.job';
import { TimelineActivityModule } from 'src/modules/timeline/timeline-activity.module';

@Module({
  imports: [TimelineActivityModule],
  providers: [
    UpsertTimelineActivityFromInternalEvent,
    DeleteTimelineActivitiesOfDestroyedLinkedRecordsJob,
  ],
})
export class TimelineJobModule {}
