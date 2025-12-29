import { Injectable } from '@nestjs/common';

import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';
import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { parseEventNameOrThrow } from 'src/engine/workspace-event-emitter/utils/parse-event-name';
import { NoteWorkspaceEntity } from 'src/modules/note/standard-objects/note.workspace-entity';
import { TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';
import { TimelineActivityRepository } from 'src/modules/timeline/repositories/timeline-activity.repository';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { type TimelineActivityPayload } from 'src/modules/timeline/types/timeline-activity-payload';

type ActivityType = 'note' | 'task';

@Injectable()
export class TimelineActivityService {
  constructor(
    @InjectObjectMetadataRepository(TimelineActivityWorkspaceEntity)
    private readonly timelineActivityRepository: TimelineActivityRepository,
    private readonly featureFlagService: FeatureFlagService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  private targetObjects: Record<ActivityType, string> = {
    note: 'noteTarget',
    task: 'taskTarget',
  };

  async upsertEvents({
    events,
    name,
    objectMetadata,
    workspaceId,
  }: WorkspaceEventBatch<ObjectRecordBaseEvent>) {
    if (!isDefined(workspaceId)) {
      return;
    }

    const { objectSingularName } = parseEventNameOrThrow(name);

    const timelineActivitiesPayloads =
      await this.transformEventsToTimelineActivityPayloads({
        events,
        objectMetadata,
        workspaceId,
        name,
      });

    if (
      !timelineActivitiesPayloads ||
      timelineActivitiesPayloads.length === 0
    ) {
      return;
    }

    const payloadsByObjectSingularName = timelineActivitiesPayloads.reduce(
      (acc, payload) => {
        const computedObjectSingularName =
          payload.overrideObjectSingularName ?? objectSingularName;

        acc[computedObjectSingularName] = [
          ...(acc[computedObjectSingularName] || []),
          payload,
        ];

        return acc;
      },
      {} as Record<string, TimelineActivityPayload[]>,
    );

    const isFeatureFlagTimelineActivityMigrated =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_TIMELINE_ACTIVITY_MIGRATED,
        workspaceId,
      );

    for (const objectSingularName in payloadsByObjectSingularName) {
      await this.timelineActivityRepository.upsertTimelineActivities({
        objectSingularName,
        workspaceId,
        payloads: payloadsByObjectSingularName[objectSingularName],
        isFeatureFlagTimelineActivityMigrated,
      });
    }
  }

  private async transformEventsToTimelineActivityPayloads({
    events,
    workspaceId,
    objectMetadata,
    name,
  }: WorkspaceEventBatch<ObjectRecordBaseEvent>): Promise<
    TimelineActivityPayload[] | undefined
  > {
    const { objectSingularName } = parseEventNameOrThrow(name);

    if (objectSingularName === 'note') {
      const noteEventsTimelineActivities =
        await this.computeTimelineActivityPayloadsForActivities({
          events: events as ObjectRecordBaseEvent<NoteWorkspaceEntity>[],
          activityType: 'note',
          workspaceId,
          objectMetadata,
          name,
        });

      return [
        ...noteEventsTimelineActivities,
        ...(events.map((event) => ({
          name,
          objectSingularName,
          recordId: event.recordId,
          workspaceMemberId: event.workspaceMemberId,
          properties: event.properties,
        })) satisfies TimelineActivityPayload[]),
      ];
    }

    if (objectSingularName === 'task') {
      const taskEventsTimelineActivities =
        await this.computeTimelineActivityPayloadsForActivities({
          events: events as ObjectRecordBaseEvent<TaskWorkspaceEntity>[],
          activityType: 'task',
          workspaceId,
          objectMetadata,
          name,
        });

      return [
        ...taskEventsTimelineActivities,
        ...(events.map((event) => ({
          name,
          objectSingularName,
          recordId: event.recordId,
          workspaceMemberId: event.workspaceMemberId,
          properties: event.properties,
        })) satisfies TimelineActivityPayload[]),
      ];
    }

    if (
      objectSingularName === 'noteTarget' ||
      objectSingularName === 'taskTarget'
    ) {
      return await this.computeTimelineActivityPayloadsForActivityTargets({
        events,
        activityType: objectSingularName === 'noteTarget' ? 'note' : 'task',
        workspaceId,
        objectMetadata,
        name,
      });
    }

    return events.map((event) => ({
      name,
      objectSingularName,
      recordId: event.recordId,
      workspaceMemberId: event.workspaceMemberId,
      properties: event.properties,
    })) satisfies TimelineActivityPayload[];
  }

  private async computeTimelineActivityPayloadsForActivities({
    events,
    activityType,
    name,
    workspaceId,
    objectMetadata,
  }: WorkspaceEventBatch<
    ObjectRecordBaseEvent<NoteWorkspaceEntity | TaskWorkspaceEntity>
  > & {
    activityType: ActivityType;
  }): Promise<TimelineActivityPayload[]> {
    if (!isDefined(workspaceId)) {
      return [];
    }

    const { action } = parseEventNameOrThrow(name);

    const authContext = buildSystemAuthContext(workspaceId);

    const activityTargets =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        authContext,
        async () => {
          const activityTargetRepository =
            await this.globalWorkspaceOrmManager.getRepository(
              workspaceId,
              this.targetObjects[activityType],
              {
                shouldBypassPermissionChecks: true,
              },
            );

          return activityTargetRepository.find({
            where: {
              [`${activityType}Id`]: In(events.map((event) => event.recordId)),
            },
          });
        },
      );

    if (activityTargets.length === 0) {
      return [];
    }

    return events
      .flatMap((event) => {
        const correspondingActivityTargets = activityTargets.filter(
          (activityTarget) =>
            activityTarget[`${activityType}Id`] === event.recordId,
        );

        if (correspondingActivityTargets.length === 0) {
          return;
        }

        return correspondingActivityTargets.map((activityTarget) => {
          const targetColumn: string | undefined = Object.entries(
            activityTarget,
          ).find(
            ([columnName, columnValue]: [string, string]) =>
              columnName !== activityType + 'Id' &&
              columnName.endsWith('Id') &&
              columnValue !== null,
          )?.[0];

          if (!isDefined(targetColumn)) {
            return;
          }

          const activityTitle = event.properties.diff?.title?.after;
          const activityId = event.recordId;

          if (!isDefined(activityTitle)) {
            return;
          }

          return {
            name: `linked-${activityType}.${action}`,
            workspaceMemberId: event.workspaceMemberId,
            recordId: activityTarget[targetColumn.replace(/Id$/, '')],
            linkedRecordCachedName: activityTitle,
            linkedRecordId: activityId,
            linkedObjectMetadataId: objectMetadata.id,
            properties: event.properties,
            overrideObjectSingularName: objectMetadata.nameSingular,
          } satisfies TimelineActivityPayload;
        });
      })
      .filter(isDefined);
  }

  private async computeTimelineActivityPayloadsForActivityTargets({
    events,
    activityType,
    name,
    objectMetadata,
    workspaceId,
  }: WorkspaceEventBatch<ObjectRecordBaseEvent> & {
    activityType: ActivityType;
  }): Promise<TimelineActivityPayload[]> {
    const { action } = parseEventNameOrThrow(name);

    const authContext = buildSystemAuthContext(workspaceId);

    const activities =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        authContext,
        async () => {
          const activityRepository =
            await this.globalWorkspaceOrmManager.getRepository(
              workspaceId,
              activityType,
              {
                shouldBypassPermissionChecks: true,
              },
            );

          return activityRepository.find({
            where: {
              id: In(
                events
                  .map((event) =>
                    this.extractActivityIdFromActivityTargetEvent(
                      event,
                      activityType,
                    ),
                  )
                  .filter(isDefined),
              ),
            },
          });
        },
      );

    if (activities.length === 0) {
      return [];
    }

    const { flatFieldMetadataMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFieldMetadataMaps'],
        },
      );

    const fields = getFlatFieldsFromFlatObjectMetadata(
      objectMetadata,
      flatFieldMetadataMaps,
    );

    const activityObjectMetadataId = fields.find(
      (field) => field.name === activityType,
    )?.relationTargetObjectMetadataId;

    return events
      .map((event) => {
        const activity = activities.find(
          (activity) =>
            activity.id ===
            this.extractActivityIdFromActivityTargetEvent(event, activityType),
        );

        if (!isDefined(activity)) {
          return;
        }

        if (!isDefined(activityObjectMetadataId)) {
          return;
        }

        if (!isDefined(event.properties.after)) {
          return;
        }

        const targetColumnName = Object.entries(event.properties.after).find(
          ([columnName, columnValue]: [string, string]) =>
            columnName !== activityType + 'Id' &&
            columnName.endsWith('Id') &&
            columnValue !== null,
        )?.[0];

        if (!isDefined(targetColumnName)) {
          return;
        }

        const recordId = (event.properties.after as ObjectRecord)[
          targetColumnName
        ];

        return {
          name: `linked-${activityType}.${action}`,
          overrideObjectSingularName: targetColumnName.replace(/Id$/, ''),
          recordId,
          linkedRecordCachedName: activity.title,
          linkedRecordId: activity.id,
          linkedObjectMetadataId: activityObjectMetadataId,
          workspaceMemberId: event.workspaceMemberId,
          properties: {},
        } satisfies TimelineActivityPayload;
      })
      .filter(isDefined);
  }

  private extractActivityIdFromActivityTargetEvent(
    event: ObjectRecordBaseEvent,
    activityType: ActivityType,
  ): string | undefined {
    const activityId = (event.properties.after as ObjectRecord)?.[
      `${activityType}Id`
    ];

    return activityId;
  }
}
