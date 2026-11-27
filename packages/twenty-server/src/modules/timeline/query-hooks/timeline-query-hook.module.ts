import { Module } from '@nestjs/common';

import { PermissionsModule } from 'src/engine/permissions/permissions.module';
import { ApplyTimelineActivitiesVisibilityRestrictionsService } from 'src/modules/timeline/query-hooks/apply-timeline-activities-visibility-restrictions.service';
import { TimelineActivityCreateManyPreQueryHook } from 'src/modules/timeline/query-hooks/timeline-activity-create-many.pre-query-hook';
import { TimelineActivityCreateOnePreQueryHook } from 'src/modules/timeline/query-hooks/timeline-activity-create-one.pre-query-hook';
import { TimelineActivityMutationQueryHookService } from 'src/modules/timeline/query-hooks/timeline-activity-mutation-query-hook.service';
import { TimelineActivityUpdateManyPreQueryHook } from 'src/modules/timeline/query-hooks/timeline-activity-update-many.pre-query-hook';
import { TimelineActivityUpdateOnePreQueryHook } from 'src/modules/timeline/query-hooks/timeline-activity-update-one.pre-query-hook';
import { TimelineActivityModule } from 'src/modules/timeline/timeline-activity.module';

@Module({
  imports: [PermissionsModule, TimelineActivityModule],
  providers: [
    ApplyTimelineActivitiesVisibilityRestrictionsService,
    TimelineActivityMutationQueryHookService,
    TimelineActivityCreateOnePreQueryHook,
    TimelineActivityCreateManyPreQueryHook,
    TimelineActivityUpdateOnePreQueryHook,
    TimelineActivityUpdateManyPreQueryHook,
  ],
})
export class TimelineQueryHookModule {}
