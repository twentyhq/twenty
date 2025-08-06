import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { ObjectRecordNonDestructiveEvent } from 'src/engine/core-modules/event-emitter/types/object-record-non-destructive-event';
import { ObjectRecordBaseEvent } from 'src/engine/core-modules/event-emitter/types/object-record.base.event';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

type TimelineActivity = Omit<ObjectRecordNonDestructiveEvent, 'properties'> & {
  name: string;
  objectName: string;
  linkedRecordCachedName?: string;
  linkedRecordId?: string;
  linkedObjectMetadataId?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: Record<string, any>; // more relaxed conditions than for internal events
};

@Injectable()
export class TimelineActivityService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  private targetObjects: Record<string, string> = {
    note: 'noteTarget',
    task: 'taskTarget',
  };

  async upsertEvents({
    events,
    eventName,
    workspaceId,
  }: {
    events: ObjectRecordBaseEvent[];
    eventName: string;
    workspaceId: string;
  }) {
    const timelineActivityRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'timelineActivity',
        {
          shouldBypassPermissionChecks: true,
        },
      );

    const timelineActivities = await this.transformEventsToTimelineActivities({
      events,
      workspaceId,
      eventName,
    });

    if (!timelineActivities || timelineActivities.length === 0) {
      return;
    }

    await timelineActivityRepository.insert(
      timelineActivities.map((timelineActivity) => ({
        linkedObjectMetadataId: timelineActivity.linkedObjectMetadataId ?? null,
        name: timelineActivity.name,
        objectName: timelineActivity.objectName,
        properties: timelineActivity.properties,
        recordId: timelineActivity.recordId,
        workspaceId,
        linkedRecordCachedName: timelineActivity.linkedRecordCachedName,
        linkedRecordId: timelineActivity.linkedRecordId,
        workspaceMemberId: timelineActivity.workspaceMemberId,
      })),
    );
  }

  private async transformEventsToTimelineActivities({
    events,
    workspaceId,
    eventName,
  }: {
    events: ObjectRecordBaseEvent[];
    workspaceId: string;
    eventName: string;
  }): Promise<TimelineActivity[] | undefined> {
    const noteEvents = events.filter(
      (event) => event.objectMetadata.nameSingular === 'note',
    );
    const taskEvents = events.filter(
      (event) => event.objectMetadata.nameSingular === 'task',
    );

    const noteTargetEvents = events.filter(
      (event) => event.objectMetadata.nameSingular === 'noteTarget',
    );
    const taskTargetEvents = events.filter(
      (event) => event.objectMetadata.nameSingular === 'taskTarget',
    );

    const noteEventsTimelineActivities = [
      ...(await this.computeTimelineActivityForActivities({
        events: noteEvents,
        activityType: 'note',
        workspaceId,
        eventName,
      })),
      ...(noteEvents.map((event) => ({
        ...event,
        name: eventName,
        objectName: event.objectMetadata.nameSingular,
      })) satisfies TimelineActivity[]),
    ];

    const taskEventsTimelineActivities = [
      ...(await this.computeTimelineActivityForActivities({
        events: taskEvents,
        activityType: 'task',
        workspaceId,
        eventName,
      })),
      ...(taskEvents.map((event) => ({
        ...event,
        objectName: event.objectMetadata.nameSingular,
        name: eventName,
      })) satisfies TimelineActivity[]),
    ];

    const noteTargetEventsTimelineActivities =
      await this.computeTimelineActivityForActivityTargets({
        events: noteTargetEvents,
        activityType: 'note',
        workspaceId,
        eventName,
      });

    const taskTargetEventsTimelineActivities =
      await this.computeTimelineActivityForActivityTargets({
        events: taskTargetEvents,
        activityType: 'task',
        workspaceId,
        eventName,
      });

    return [
      ...noteEventsTimelineActivities,
      ...taskEventsTimelineActivities,
      ...noteTargetEventsTimelineActivities,
      ...taskTargetEventsTimelineActivities,
    ];
  }

  private async computeTimelineActivityForActivities({
    events,
    activityType,
    eventName,
    workspaceId,
  }: {
    events: ObjectRecordBaseEvent[];
    activityType: string;
    eventName: string;
    workspaceId: string;
  }) {
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
        [activityType + 'Id']: In(events.map((event) => event.recordId)),
      },
    });

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
        id: In(events.map((event) => event.recordId)),
      },
    });

    if (activityTargets.length === 0 || activities.length === 0) {
      return [];
    }

    return events
      .flatMap((event) => {
        const correspondingActivityTargets = activityTargets.filter(
          (activityTarget) => activityTarget.id === event.recordId,
        );

        const correspondingActivity = activities.find(
          (activity) => activity.id === event.recordId,
        );

        if (
          correspondingActivityTargets.length === 0 ||
          !isDefined(correspondingActivity)
        ) {
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

          return {
            ...event,
            name: 'linked-' + eventName,
            objectName: targetColumn[0].replace(/Id$/, ''),
            recordId: activityTarget[targetColumn[0]],
            linkedRecordCachedName: correspondingActivity.title,
            linkedRecordId: correspondingActivity.id,
            linkedObjectMetadataId: event.objectMetadata.id,
          };
        });
      })
      .filter(isDefined);
  }

  private async computeTimelineActivityForActivityTargets({
    events,
    activityType,
    eventName,
    workspaceId,
  }: {
    events: ObjectRecordBaseEvent[];
    activityType: 'task' | 'note';
    eventName: string;
    workspaceId: string;
  }): Promise<TimelineActivity[]> {
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
        id: In(events.map((event) => event.recordId)),
      },
    });

    if (activityTargets.length === 0) {
      return [];
    }

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
          activityTargets.map((activityTarget) => activityTarget.activityId),
        ),
      },
    });

    if (activities.length === 0) {
      return [];
    }

    const activityObjectMetadataId = events[0].objectMetadata.fields.find(
      (field) => field.name === activityType,
    )?.relationTargetObjectMetadataId;

    return events
      .map((event) => {
        const activityTarget = activityTargets.find(
          (activityTarget) => activityTarget.id === event.recordId,
        );

        const activity = activities.find(
          (activity) => activity.id === activityTarget?.activityId,
        );

        if (!isDefined(activityTarget) || !isDefined(activity)) {
          return;
        }

        const targetColumnName = Object.entries(activityTarget).find(
          ([columnName, columnValue]: [string, string]) =>
            columnName !== activityType + 'Id' &&
            columnName.endsWith('Id') &&
            columnValue !== null,
        )?.[0];

        if (!isDefined(targetColumnName)) {
          return;
        }

        return {
          ...event,
          name: 'linked-' + eventName,
          properties: {},
          objectName: targetColumnName.replace(/Id$/, ''),
          recordId: activityTarget[targetColumnName],
          linkedRecordCachedName: activity.title,
          linkedRecordId: activity.id,
          linkedObjectMetadataId: activityObjectMetadataId,
        };
      })
      .filter(isDefined);
  }
}
