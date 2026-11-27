import { Injectable, type OnModuleInit } from '@nestjs/common';

import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { CommonRecordVisibilityService } from 'src/engine/api/common/common-record-visibility/common-record-visibility.service';
import { isSystemAuthContext } from 'src/engine/core-modules/auth/guards/is-system-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type RecordVisibilityRestrictionHandler } from 'src/engine/api/common/common-record-visibility/types/record-visibility-restriction-handler.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { RecordPermissionsReadService } from 'src/engine/permissions/record-permissions-read.service';
import { type RecordReadRestrictions } from 'src/engine/permissions/types/record-read-restrictions.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildIsTimelineActivityRecordReadable } from 'src/modules/timeline/utils/build-is-timeline-activity-record-readable.util';
import { omitRestrictedFieldsFromTimelineActivityEvent } from 'src/modules/timeline/utils/omit-restricted-fields-from-timeline-activity-event.util';
import {
  type IsTimelineActivityRecordReadable,
  omitRestrictedFieldsFromTimelineActivity,
} from 'src/modules/timeline/utils/omit-restricted-fields-from-timeline-activity.util';

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
    authContext,
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

    const isRecordReadable = await this.buildIsRecordReadableForCaller({
      timelineActivities,
      authContext,
      permissionsPrincipals,
      recordReadRestrictions,
      flatObjectMetadataMaps,
    });

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

  public async applyEventVisibilityRestrictions<
    TEvent extends ObjectRecordEvent,
  >({
    events,
    permissionsPrincipals,
    recordReadRestrictions,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    events: TEvent[];
    permissionsPrincipals: PermissionsPrincipalsWithRolesContext;
    recordReadRestrictions: RecordReadRestrictions;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  }): Promise<TEvent[]> {
    const isRecordReadable = await this.buildIsRecordReadable({
      timelineActivities: events.flatMap(({ properties }) =>
        [
          'before' in properties ? properties.before : undefined,
          'after' in properties ? properties.after : undefined,
        ].filter(isPlainObject),
      ),
      permissionsPrincipals,
      recordReadRestrictions,
      flatObjectMetadataMaps,
    });

    return events.map((event) =>
      omitRestrictedFieldsFromTimelineActivityEvent({
        event,
        recordReadRestrictions,
        isRecordReadable,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    );
  }

  private async buildIsRecordReadableForCaller({
    authContext,
    permissionsPrincipals,
    ...question
  }: Omit<
    Parameters<typeof buildIsTimelineActivityRecordReadable>[0],
    'filterReadableRecordIds'
  > & {
    authContext: WorkspaceAuthContext;
    permissionsPrincipals: PermissionsPrincipalsWithRolesContext | undefined;
  }): Promise<IsTimelineActivityRecordReadable> {
    if (isSystemAuthContext(authContext)) {
      return () => true;
    }

    if (!isDefined(permissionsPrincipals)) {
      return () => false;
    }

    return this.buildIsRecordReadable({ ...question, permissionsPrincipals });
  }

  private buildIsRecordReadable({
    timelineActivities,
    permissionsPrincipals,
    recordReadRestrictions,
    flatObjectMetadataMaps,
  }: Omit<
    Parameters<typeof buildIsTimelineActivityRecordReadable>[0],
    'filterReadableRecordIds'
  > & { permissionsPrincipals: PermissionsPrincipalsWithRolesContext }) {
    return buildIsTimelineActivityRecordReadable({
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
    });
  }
}
