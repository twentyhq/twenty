import { Injectable, type OnModuleInit } from '@nestjs/common';

import { CommonRecordVisibilityService } from 'src/engine/api/common/common-record-visibility/common-record-visibility.service';
import { type RecordVisibilityRestrictionHandler } from 'src/engine/api/common/common-record-visibility/types/record-visibility-restriction-handler.type';
import { redactTimelineActivityProperties } from 'src/modules/timeline/utils/redact-timeline-activity-properties.util';

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
    for (const timelineActivity of records) {
      if (!('properties' in timelineActivity)) {
        continue;
      }

      timelineActivity.properties = redactTimelineActivityProperties({
        properties: timelineActivity.properties,
        timelineActivity,
        objectsPermissions,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });
    }
  }
}
