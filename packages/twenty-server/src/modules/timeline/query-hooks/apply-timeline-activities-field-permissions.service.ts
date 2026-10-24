import { Injectable, type OnModuleInit } from '@nestjs/common';

import { CommonRecordVisibilityService } from 'src/engine/api/common/common-record-visibility/common-record-visibility.service';
import { type RecordVisibilityRestrictionContext } from 'src/engine/api/common/common-record-visibility/types/record-visibility-restriction-context.type';
import { type RecordVisibilityRestrictionHandler } from 'src/engine/api/common/common-record-visibility/types/record-visibility-restriction-handler.type';
import { keepReadableFieldsInTimelineActivities } from 'src/modules/timeline/utils/keep-readable-fields-in-timeline-activities.util';
import { resolveTimelineActivityObjectColumnNames } from 'src/modules/timeline/utils/resolve-timeline-activity-object-column-names.util';

@Injectable()
export class ApplyTimelineActivitiesFieldPermissionsService
  implements RecordVisibilityRestrictionHandler, OnModuleInit
{
  constructor(
    private readonly commonRecordVisibilityService: CommonRecordVisibilityService,
  ) {}

  onModuleInit() {
    this.commonRecordVisibilityService.registerHandler({
      objectNameSingular: 'timelineActivity',
      handler: this,
    });
  }

  public async applyVisibilityRestrictions({
    records,
    ...context
  }: RecordVisibilityRestrictionContext & {
    records: Record<string, unknown>[];
  }): Promise<void> {
    keepReadableFieldsInTimelineActivities({
      timelineActivities: records,
      ...context,
    });
  }

  public async applyEventVisibilityRestrictions(
    args: RecordVisibilityRestrictionContext & {
      records: Record<string, unknown>[];
    },
  ): Promise<void> {
    await this.applyVisibilityRestrictions(args);
  }

  public getRequiredFieldNamesToSelect(
    args: Parameters<
      NonNullable<
        RecordVisibilityRestrictionHandler['getRequiredFieldNamesToSelect']
      >
    >[0],
  ): string[] {
    return resolveTimelineActivityObjectColumnNames(args);
  }
}
