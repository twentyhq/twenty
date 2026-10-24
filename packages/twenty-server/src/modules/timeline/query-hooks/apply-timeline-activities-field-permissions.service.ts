import { Injectable, type OnModuleInit } from '@nestjs/common';

import { CommonRecordVisibilityService } from 'src/engine/api/common/common-record-visibility/common-record-visibility.service';
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
    objectsPermissions,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: Parameters<
    RecordVisibilityRestrictionHandler['applyVisibilityRestrictions']
  >[0]): Promise<void> {
    keepReadableFieldsInTimelineActivities({
      timelineActivities: records,
      objectsPermissions,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });
  }

  public async applyEventVisibilityRestrictions({
    records,
    objectsPermissions,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: Parameters<
    NonNullable<
      RecordVisibilityRestrictionHandler['applyEventVisibilityRestrictions']
    >
  >[0]): Promise<void> {
    keepReadableFieldsInTimelineActivities({
      timelineActivities: records,
      objectsPermissions,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });
  }

  public getRequiredFieldNames(
    args: Parameters<
      NonNullable<RecordVisibilityRestrictionHandler['getRequiredFieldNames']>
    >[0],
  ): string[] {
    return resolveTimelineActivityObjectColumnNames(args);
  }
}
