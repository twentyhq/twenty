import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { type ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type ObjectRecordBaseEvent } from 'src/engine/core-modules/event-emitter/types/object-record.base.event';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { parseEventNameOrThrow } from 'src/engine/workspace-event-emitter/utils/parse-event-name';
import { TimelineActivityRepository } from 'src/modules/timeline/repositories/timeline-activity.repository';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { type TimelineActivityPayload } from 'src/modules/timeline/types/timeline-activity-payload';

type ActivityType = 'note' | 'task';

type EventsWithNameAndWorkspaceId = {
  events: ObjectRecordBaseEvent[];
  eventName: string;
  workspaceId: string;
};

@Injectable()
export class TimelineActivityService {
  constructor(
    @InjectObjectMetadataRepository(TimelineActivityWorkspaceEntity)
    private readonly timelineActivityRepository: TimelineActivityRepository,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  private targetObjects: Record<ActivityType, string> = {
    note: 'noteTarget',
    task: 'taskTarget',
  };

  async upsertEvents({
    events,
    eventName,
    workspaceId,
  }: EventsWithNameAndWorkspaceId) {
    const { objectSingularName } = parseEventNameOrThrow(eventName);

    const timelineActivitiesPayloads =
      await this.transformEventsToTimelineActivityPayloads({
        events,
        workspaceId,
        eventName,
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

    for (const objectSingularName in payloadsByObjectSingularName) {
      this.timelineActivityRepository.upsertTimelineActivities({
        objectSingularName,
        workspaceId,
        payloads: payloadsByObjectSingularName[objectSingularName],
      });
    }
  }

  private async transformEventsToTimelineActivityPayloads({
    events,
    workspaceId,
    eventName,
  }: EventsWithNameAndWorkspaceId): Promise<
    TimelineActivityPayload[] | undefined
  > {
    const { objectSingularName } = parseEventNameOrThrow(eventName);

    if (objectSingularName === 'note') {
      const noteEventsTimelineActivities =
        await this.computeTimelineActivityPayloadsForActivities({
          events,
          activityType: 'note',
          workspaceId,
          eventName,
        });

      return [
        ...noteEventsTimelineActivities,
        ...(events.map((event) => ({
          name: eventName,
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
          events,
          activityType: 'task',
          workspaceId,
          eventName,
        });

      return [
        ...taskEventsTimelineActivities,
        ...(events.map((event) => ({
          name: eventName,
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
        eventName,
      });
    }

    return events.map((event) => ({
      name: eventName,
      objectSingularName,
      recordId: event.recordId,
      workspaceMemberId: event.workspaceMemberId,
      properties: event.properties,
    })) satisfies TimelineActivityPayload[];
  }

  private async computeTimelineActivityPayloadsForActivities({
    events,
    activityType,
    eventName,
    workspaceId,
  }: EventsWithNameAndWorkspaceId & { activityType: ActivityType }): Promise<
    TimelineActivityPayload[]
  > {
    const { action } = parseEventNameOrThrow(eventName);

    const activityTargetRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        this.targetObjects[activityType],
        {
          shouldBypassPermissionChecks: true,
        },
      );

    const activityTargets = await activityTargetRepository.find({
      where: {
        [`${activityType}Id`]: In(events.map((event) => event.recordId)),
      },
    });

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

          const activityTitle = (event.properties.after as ObjectRecord)?.title;
          const activityId = event.recordId;

          if (!isDefined(activityTitle)) {
            return;
          }

          return {
            name: `linked-${activityType}.${action}`,
            workspaceMemberId: event.workspaceMemberId ?? '',
            recordId: activityTarget[targetColumn.replace(/Id$/, '')],
            linkedRecordCachedName: activityTitle,
            linkedRecordId: activityId,
            linkedObjectMetadataId: event.objectMetadata.id,
            properties: event.properties,
            overrideObjectSingularName: event.objectMetadata.nameSingular,
          } satisfies TimelineActivityPayload;
        });
      })
      .filter(isDefined);
  }

  private async computeTimelineActivityPayloadsForActivityTargets({
    events,
    activityType,
    eventName,
    workspaceId,
  }: EventsWithNameAndWorkspaceId & { activityType: ActivityType }): Promise<
    TimelineActivityPayload[]
  > {
    const { action } = parseEventNameOrThrow(eventName);

    const activityRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        activityType,
        {
          shouldBypassPermissionChecks: true,
        },
      );

    const activities = await activityRepository.find({
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

    if (activities.length === 0) {
      return [];
    }

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

        const activityObjectMetadataId = event.objectMetadata.fields.find(
          (field) => field.name === activityType,
        )?.relationTargetObjectMetadataId;

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
