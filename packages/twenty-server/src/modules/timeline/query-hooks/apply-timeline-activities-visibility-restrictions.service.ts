import { Injectable, type OnModuleInit } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray, isPlainObject } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { RecordVisibilityRestrictionsService } from 'src/engine/permissions/record-visibility-restrictions.service';
import { type RecordVisibilityRestrictionHandler } from 'src/engine/permissions/types/record-visibility-restriction-handler.type';
import { isSystemAuthContext } from 'src/engine/core-modules/auth/guards/is-system-auth-context.guard';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { RecordPermissionsReadService } from 'src/engine/permissions/record-permissions-read.service';
import { type RecordReadRestrictions } from 'src/engine/permissions/types/record-read-restrictions.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildIsTimelineActivityRecordReadable } from 'src/modules/timeline/utils/build-is-timeline-activity-record-readable.util';
import { findTimelineActivitySubjectColumnNames } from 'src/modules/timeline/utils/find-timeline-activity-subject-column-names.util';
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
    private readonly recordVisibilityRestrictionsService: RecordVisibilityRestrictionsService,
    private readonly recordPermissionsReadService: RecordPermissionsReadService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  onModuleInit() {
    this.recordVisibilityRestrictionsService.registerHandler({
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

    // The columns linking an activity to its record may be unreadable to the caller, so they are read here
    const subjectColumnsByTimelineActivityId =
      await this.findSubjectColumnsByTimelineActivityId({
        workspaceId: authContext.workspace.id,
        timelineActivityIds: timelineActivities
          .map(({ id }) => id)
          .filter(isNonEmptyString),
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

    const isRecordReadable = isSystemAuthContext(authContext)
      ? () => true
      : await this.buildIsRecordReadable({
          timelineActivities: [...subjectColumnsByTimelineActivityId.values()],
          permissionsPrincipals,
          flatObjectMetadataMaps,
        });

    for (const timelineActivity of timelineActivities) {
      timelineActivity.properties = omitRestrictedFieldsFromTimelineActivity({
        properties: timelineActivity.properties,
        timelineActivity:
          subjectColumnsByTimelineActivityId.get(timelineActivity.id) ?? {},
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
    const timelineActivitySnapshots = events.flatMap(({ properties }) =>
      [
        'before' in properties ? properties.before : undefined,
        'after' in properties ? properties.after : undefined,
      ].filter(isPlainObject),
    );

    const isRecordReadable = await this.buildIsRecordReadable({
      timelineActivities: timelineActivitySnapshots,
      permissionsPrincipals,
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

  private async buildIsRecordReadable({
    timelineActivities,
    permissionsPrincipals,
    flatObjectMetadataMaps,
  }: {
    timelineActivities: Record<string, unknown>[];
    permissionsPrincipals: PermissionsPrincipalsWithRolesContext | undefined;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  }): Promise<IsTimelineActivityRecordReadable> {
    if (!isDefined(permissionsPrincipals)) {
      return () => false;
    }

    return buildIsTimelineActivityRecordReadable({
      timelineActivities,
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

  private async findSubjectColumnsByTimelineActivityId({
    workspaceId,
    timelineActivityIds,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    workspaceId: string;
    timelineActivityIds: string[];
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  }): Promise<Map<string, ObjectRecord>> {
    const timelineActivityFlatObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.timelineActivity.universalIdentifier
      ];

    if (
      !isDefined(timelineActivityFlatObjectMetadata) ||
      !isNonEmptyArray(timelineActivityIds)
    ) {
      return new Map();
    }

    const timelineActivities =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.workspaceOrmManager
            .getRepositoryWithoutPermissionChecks<ObjectRecord>(
              'timelineActivity',
            )
            .find({
              select: [
                'id',
                ...findTimelineActivitySubjectColumnNames({
                  timelineActivityFlatObjectMetadata,
                  flatFieldMetadataMaps,
                }),
              ],
              where: { id: In(timelineActivityIds) },
              withDeleted: true,
            }),
        buildSystemAuthContext(workspaceId),
        { lite: true },
      );

    return new Map(
      timelineActivities.map((timelineActivity) => [
        timelineActivity.id,
        timelineActivity,
      ]),
    );
  }
}
