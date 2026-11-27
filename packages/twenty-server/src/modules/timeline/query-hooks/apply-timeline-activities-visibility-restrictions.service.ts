import { Injectable, type OnModuleInit } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { CommonRecordVisibilityService } from 'src/engine/api/common/common-record-visibility/common-record-visibility.service';
import { type RecordVisibilityRestrictionHandler } from 'src/engine/api/common/common-record-visibility/types/record-visibility-restriction-handler.type';
import { RecordPermissionsReadService } from 'src/engine/permissions/record-permissions-read.service';
import { buildIsTimelineActivityRecordReadable } from 'src/modules/timeline/utils/build-is-timeline-activity-record-readable.util';
import { omitRestrictedFieldsFromTimelineActivity } from 'src/modules/timeline/utils/omit-restricted-fields-from-timeline-activity.util';

@Injectable()
export class ApplyTimelineActivitiesVisibilityRestrictionsService
  implements RecordVisibilityRestrictionHandler, OnModuleInit
{
  constructor(
    private readonly commonRecordVisibilityService: CommonRecordVisibilityService,
    private readonly recordPermissionsReadService: RecordPermissionsReadService,
  ) {}

  onModuleInit() {
    this.commonRecordVisibilityService.registerHandler({
      objectNameSingular: 'timelineActivity',
      handler: this,
    });
  }

  public async applyVisibilityRestrictions({
    records,
    permissionsPrincipals,
    recordReadRestrictions,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: Parameters<
    RecordVisibilityRestrictionHandler['applyVisibilityRestrictions']
  >[0]): Promise<void> {
    const timelineActivities = records.filter(
      (timelineActivity) => 'properties' in timelineActivity,
    );

    if (timelineActivities.length === 0) {
      return;
    }

    // Without principals the read runs with system access
    const isRecordReadable = isDefined(permissionsPrincipals)
      ? await buildIsTimelineActivityRecordReadable({
          timelineActivities,
          recordReadRestrictions,
          flatObjectMetadataMaps,
          filterReadableRecordIds: ({ objectMetadataId, recordIds }) =>
            this.recordPermissionsReadService.filterGrantedRecordIds({
              principals: permissionsPrincipals,
              objectMetadataId,
              operationType: 'read',
              recordIds,
            }),
        })
      : () => true;

    for (const timelineActivity of timelineActivities) {
      timelineActivity.properties = omitRestrictedFieldsFromTimelineActivity({
        properties: timelineActivity.properties,
        timelineActivity,
        recordReadRestrictions,
        isRecordReadable,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });
    }
  }
}
