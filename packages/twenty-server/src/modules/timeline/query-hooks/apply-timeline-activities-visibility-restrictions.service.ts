import { Injectable, type OnModuleInit } from '@nestjs/common';

import { CommonRecordVisibilityService } from 'src/engine/api/common/common-record-visibility/common-record-visibility.service';
import { type RecordVisibilityRestrictionHandler } from 'src/engine/api/common/common-record-visibility/types/record-visibility-restriction-handler.type';
import { omitRestrictedFieldsFromTimelineActivity } from 'src/modules/timeline/utils/omit-restricted-fields-from-timeline-activity.util';

@Injectable()
export class ApplyTimelineActivitiesVisibilityRestrictionsService
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
    for (const timelineActivity of records) {
      if (!('properties' in timelineActivity)) {
        continue;
      }

      timelineActivity.properties = omitRestrictedFieldsFromTimelineActivity({
        properties: timelineActivity.properties,
        timelineActivity,
        objectsPermissions,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });
    }
  }
}
