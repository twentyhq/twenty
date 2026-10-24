import { Injectable, type OnModuleInit } from '@nestjs/common';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  type ObjectRecord,
  type ObjectsPermissions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { CommonRecordVisibilityService } from 'src/engine/api/common/common-record-visibility/common-record-visibility.service';
import { type RecordVisibilityRestrictionHandler } from 'src/engine/api/common/common-record-visibility/types/record-visibility-restriction-handler.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildRestrictedFieldNames } from 'src/engine/core-modules/record-share/utils/omit-restricted-fields-from-event.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type TimelineActivityTargetJoinColumn } from 'src/modules/timeline/types/timeline-activity-target-join-column.type';
import { omitReadDeniedFieldsFromTimelineActivityProperties } from 'src/modules/timeline/utils/omit-read-denied-fields-from-timeline-activity-properties.util';
import { resolveTimelineActivitySubjectObjectMetadataId } from 'src/modules/timeline/utils/resolve-timeline-activity-subject-object-metadata-id.util';
import { resolveTimelineActivityTargetJoinColumns } from 'src/modules/timeline/utils/resolve-timeline-activity-target-join-columns.util';

const hasSubjectColumns = ({
  timelineActivity,
  targetJoinColumns,
}: {
  timelineActivity: Record<string, unknown>;
  targetJoinColumns: TimelineActivityTargetJoinColumn[];
}): boolean =>
  'linkedObjectMetadataId' in timelineActivity &&
  targetJoinColumns.every(
    ({ joinColumnName }) => joinColumnName in timelineActivity,
  );

@Injectable()
export class ApplyTimelineActivitiesFieldPermissionsService
  implements RecordVisibilityRestrictionHandler, OnModuleInit
{
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
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
    authContext,
    objectsPermissions,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    records: ObjectRecord[];
    authContext: WorkspaceAuthContext;
    objectsPermissions: ObjectsPermissions;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  }): Promise<void> {
    const timelineActivityFlatObjectMetadata =
      findFlatEntityByUniversalIdentifier({
        universalIdentifier:
          STANDARD_OBJECTS.timelineActivity.universalIdentifier,
        flatEntityMaps: flatObjectMetadataMaps,
      });
    const timelineActivities = records.filter(
      (record) => 'properties' in record,
    );

    if (
      !isDefined(timelineActivityFlatObjectMetadata) ||
      timelineActivities.length === 0
    ) {
      return;
    }

    const targetJoinColumns = resolveTimelineActivityTargetJoinColumns({
      timelineActivityFlatObjectMetadata,
      flatFieldMetadataMaps,
    });

    const storedTimelineActivityById =
      await this.findStoredTimelineActivitiesMissingSubjectColumns({
        timelineActivities,
        targetJoinColumns,
        workspaceId: authContext.workspace.id,
      });

    this.omitReadDeniedFields({
      timelineActivities,
      resolveSubjectRecord: (timelineActivity) =>
        storedTimelineActivityById.get(timelineActivity.id) ?? timelineActivity,
      targetJoinColumns,
      objectsPermissions,
      flatFieldMetadataMaps,
    });
  }

  public async applyEventVisibilityRestrictions({
    records,
    flatObjectMetadata,
    objectsPermissions,
    flatFieldMetadataMaps,
  }: {
    records: Record<string, unknown>[];
    flatObjectMetadata: FlatObjectMetadata;
    objectsPermissions: ObjectsPermissions;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  }): Promise<void> {
    this.omitReadDeniedFields({
      timelineActivities: records,
      resolveSubjectRecord: (timelineActivity) => timelineActivity,
      targetJoinColumns: resolveTimelineActivityTargetJoinColumns({
        timelineActivityFlatObjectMetadata: flatObjectMetadata,
        flatFieldMetadataMaps,
      }),
      objectsPermissions,
      flatFieldMetadataMaps,
    });
  }

  private omitReadDeniedFields<TRecord extends Record<string, unknown>>({
    timelineActivities,
    resolveSubjectRecord,
    targetJoinColumns,
    objectsPermissions,
    flatFieldMetadataMaps,
  }: {
    timelineActivities: TRecord[];
    resolveSubjectRecord: (
      timelineActivity: TRecord,
    ) => Record<string, unknown>;
    targetJoinColumns: TimelineActivityTargetJoinColumn[];
    objectsPermissions: ObjectsPermissions;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  }): void {
    for (const timelineActivity of timelineActivities) {
      const subjectObjectMetadataId =
        resolveTimelineActivitySubjectObjectMetadataId({
          timelineActivity: resolveSubjectRecord(timelineActivity),
          targetJoinColumns,
        });

      if (!isDefined(subjectObjectMetadataId)) {
        continue;
      }

      Object.assign(timelineActivity, {
        properties: omitReadDeniedFieldsFromTimelineActivityProperties({
          properties: timelineActivity.properties,
          readDeniedFieldNames: buildRestrictedFieldNames({
            restrictedFields:
              objectsPermissions[subjectObjectMetadataId]?.restrictedFields ??
              {},
            flatFieldMetadataMaps,
          }),
        }),
      });
    }
  }

  private async findStoredTimelineActivitiesMissingSubjectColumns({
    timelineActivities,
    targetJoinColumns,
    workspaceId,
  }: {
    timelineActivities: ObjectRecord[];
    targetJoinColumns: TimelineActivityTargetJoinColumn[];
    workspaceId: string;
  }): Promise<Map<string, ObjectRecord>> {
    const timelineActivityIdsMissingSubjectColumns = timelineActivities
      .filter(
        (timelineActivity) =>
          !hasSubjectColumns({ timelineActivity, targetJoinColumns }),
      )
      .map((timelineActivity) => timelineActivity.id);

    if (timelineActivityIdsMissingSubjectColumns.length === 0) {
      return new Map();
    }

    const storedTimelineActivities =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        async () =>
          this.workspaceOrmManager
            .getRepository<ObjectRecord>('timelineActivity', {
              shouldBypassPermissionChecks: true,
            })
            .find({
              where: { id: In(timelineActivityIdsMissingSubjectColumns) },
              withDeleted: true,
            }),
        buildSystemAuthContext(workspaceId),
        { lite: true },
      );

    return new Map(
      storedTimelineActivities.map((timelineActivity) => [
        timelineActivity.id,
        timelineActivity,
      ]),
    );
  }
}
