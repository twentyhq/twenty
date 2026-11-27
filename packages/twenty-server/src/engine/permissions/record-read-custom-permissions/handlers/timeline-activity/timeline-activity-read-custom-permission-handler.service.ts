import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray, isPlainObject } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { RecordReadCustomPermissionHandler } from 'src/engine/permissions/record-read-custom-permissions/decorators/record-read-custom-permission-handler.decorator';
import {
  type RecordReadCustomPermissionEventsInput,
  type RecordReadCustomPermissionHandlerService,
  type RecordReadCustomPermissionRecordsInput,
} from 'src/engine/permissions/record-read-custom-permissions/types/record-read-custom-permission-handler-service.type';
import { isSystemAuthContext } from 'src/engine/core-modules/auth/guards/is-system-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { PrincipalPermissionsReadService } from 'src/engine/permissions/principal-permissions-read.service';
import { RecordPermissionsReadService } from 'src/engine/permissions/record-permissions-read.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildIsTimelineActivitySourceRecordReadable } from 'src/engine/permissions/record-read-custom-permissions/handlers/timeline-activity/utils/build-is-timeline-activity-source-record-readable.util';
import { findTimelineActivitySourceColumnNames } from 'src/engine/permissions/record-read-custom-permissions/handlers/timeline-activity/utils/find-timeline-activity-source-column-names.util';
import { omitUnreadableFieldsFromTimelineActivityEvent } from 'src/engine/permissions/record-read-custom-permissions/handlers/timeline-activity/utils/omit-unreadable-fields-from-timeline-activity-event.util';
import {
  type IsTimelineActivitySourceRecordReadable,
  omitUnreadableFieldsFromTimelineActivityProperties,
} from 'src/engine/permissions/record-read-custom-permissions/handlers/timeline-activity/utils/omit-unreadable-fields-from-timeline-activity-properties.util';

@Injectable()
@RecordReadCustomPermissionHandler('timelineActivity')
export class TimelineActivityReadCustomPermissionHandlerService implements RecordReadCustomPermissionHandlerService {
  constructor(
    private readonly principalPermissionsReadService: PrincipalPermissionsReadService,
    private readonly recordPermissionsReadService: RecordPermissionsReadService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  public async applyToRecords({
    records,
    authContext,
    recordReadRestrictions,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: RecordReadCustomPermissionRecordsInput): Promise<void> {
    const timelineActivities = records.filter(
      (timelineActivity) => 'properties' in timelineActivity,
    );

    if (timelineActivities.length === 0) {
      return;
    }

    const sourceColumnsByTimelineActivityId =
      await this.findSourceColumnsByTimelineActivityId({
        workspaceId: authContext.workspace.id,
        timelineActivityIds: timelineActivities
          .map(({ id }) => id)
          .filter(isNonEmptyString),
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

    const isSourceRecordReadable =
      await this.buildIsSourceRecordReadableForAuthContext({
        authContext,
        timelineActivities: [...sourceColumnsByTimelineActivityId.values()],
        flatObjectMetadataMaps,
      });

    for (const timelineActivity of timelineActivities) {
      timelineActivity.properties =
        omitUnreadableFieldsFromTimelineActivityProperties({
          properties: timelineActivity.properties,
          timelineActivity:
            sourceColumnsByTimelineActivityId.get(timelineActivity.id) ?? {},
          recordReadRestrictions,
          isSourceRecordReadable,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        });
    }
  }

  public async applyToEvents<TEvent extends ObjectRecordEvent>({
    events,
    permissionsPrincipals,
    recordReadRestrictions,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: RecordReadCustomPermissionEventsInput<TEvent>): Promise<TEvent[]> {
    const timelineActivitySnapshots = events.flatMap(({ properties }) =>
      [
        'before' in properties ? properties.before : undefined,
        'after' in properties ? properties.after : undefined,
      ].filter(isPlainObject),
    );

    const isSourceRecordReadable =
      await this.buildIsSourceRecordReadableForPrincipals({
        timelineActivities: timelineActivitySnapshots,
        permissionsPrincipals,
        flatObjectMetadataMaps,
      });

    return events.map((event) =>
      omitUnreadableFieldsFromTimelineActivityEvent({
        event,
        recordReadRestrictions,
        isSourceRecordReadable,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    );
  }

  private async buildIsSourceRecordReadableForAuthContext({
    authContext,
    timelineActivities,
    flatObjectMetadataMaps,
  }: {
    authContext: WorkspaceAuthContext;
    timelineActivities: Record<string, unknown>[];
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  }): Promise<IsTimelineActivitySourceRecordReadable> {
    if (isSystemAuthContext(authContext)) {
      return () => true;
    }

    return this.buildIsSourceRecordReadableForPrincipals({
      timelineActivities,
      permissionsPrincipals:
        await this.principalPermissionsReadService.resolvePermissionsPrincipals(
          { authContext },
        ),
      flatObjectMetadataMaps,
    });
  }

  private async buildIsSourceRecordReadableForPrincipals({
    timelineActivities,
    permissionsPrincipals,
    flatObjectMetadataMaps,
  }: {
    timelineActivities: Record<string, unknown>[];
    permissionsPrincipals: PermissionsPrincipalsWithRolesContext | undefined;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  }): Promise<IsTimelineActivitySourceRecordReadable> {
    if (!isDefined(permissionsPrincipals)) {
      return () => false;
    }

    return buildIsTimelineActivitySourceRecordReadable({
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

  private async findSourceColumnsByTimelineActivityId({
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
                ...findTimelineActivitySourceColumnNames({
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
