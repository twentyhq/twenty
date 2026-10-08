import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { TimelineActivityTypeCacheService } from 'src/modules/timeline/services/timeline-activity-type-cache.service';
import { type TimelineActivityMutationInput } from 'src/modules/timeline/query-hooks/types/timeline-activity-mutation-input.type';
import {
  assertTimelineActivityCreationInputIsValid,
  stampTimelineActivityTypeSnapshots,
} from 'src/modules/timeline/query-hooks/utils/timeline-activity-mutation-input.util';

@Injectable()
export class TimelineActivityMutationQueryHookService {
  constructor(
    private readonly timelineActivityTypeCacheService: TimelineActivityTypeCacheService,
  ) {}

  async stampTimelineActivityTypeSnapshot({
    workspaceId,
    applicationId,
    records,
    upsert,
  }: {
    workspaceId: string;
    applicationId?: string;
    records: TimelineActivityMutationInput[];
    upsert?: boolean;
  }): Promise<TimelineActivityMutationInput[]> {
    assertTimelineActivityCreationInputIsValid({ records, upsert });

    const resolvedTimelineActivityTypeById = new Map(
      await Promise.all(
        [
          ...new Set(
            records
              .map(({ timelineActivityTypeId }) => timelineActivityTypeId)
              .filter(isDefined),
          ),
        ].map(
          async (timelineActivityTypeId) =>
            [
              timelineActivityTypeId,
              await this.timelineActivityTypeCacheService.getTimelineActivityTypeByIdOrThrow(
                { workspaceId, timelineActivityTypeId },
              ),
            ] as const,
        ),
      ),
    );

    return stampTimelineActivityTypeSnapshots({
      applicationId,
      records,
      resolvedTimelineActivityTypeById,
    });
  }
}
