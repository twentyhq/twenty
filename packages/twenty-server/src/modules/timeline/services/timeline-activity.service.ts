import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { ObjectRecordBaseEvent } from 'src/engine/core-modules/event-emitter/types/object-record.base.event';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { parseEventNameOrThrow } from 'src/engine/workspace-event-emitter/utils/parse-event-name';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

type TimelineActivity = Pick<
  TimelineActivityWorkspaceEntity,
  | 'name'
  | 'linkedRecordCachedName'
  | 'linkedRecordId'
  | 'linkedObjectMetadataId'
  | 'workspaceMemberId'
> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: Record<string, any>;
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
        properties: timelineActivity.properties,
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
    const { objectName } = parseEventNameOrThrow(eventName);

    if (objectName === 'note') {
      const noteEventsTimelineActivities =
        await this.computeTimelineActivityForActivities({
          events,
          activityType: 'note',
          workspaceId,
          eventName,
        });

      return [
        ...noteEventsTimelineActivities,
        ...(events.map((event) => ({
          name: eventName,
          linkedRecordCachedName: '',
          linkedRecordId: '',
          linkedObjectMetadataId: '',
          workspaceMemberId: event.workspaceMemberId ?? '',
          properties: event.properties,
        })) satisfies TimelineActivity[]),
      ];
    }

    if (objectName === 'task') {
      const taskEventsTimelineActivities =
        await this.computeTimelineActivityForActivities({
          events,
          activityType: 'task',
          workspaceId,
          eventName,
        });

      return [
        ...taskEventsTimelineActivities,
        ...(events.map((event) => ({
          name: eventName,
          linkedRecordCachedName: '',
          linkedRecordId: '',
          linkedObjectMetadataId: '',
          workspaceMemberId: event.workspaceMemberId ?? '',
          properties: event.properties,
        })) satisfies TimelineActivity[]),
      ];
    }

    if (objectName === 'noteTarget' || objectName === 'taskTarget') {
      return await this.computeTimelineActivityForActivityTargets({
        events,
        activityType: objectName === 'noteTarget' ? 'note' : 'task',
        workspaceId,
        eventName,
      });
    }

    return events.map((event) => ({
      name: eventName,
      linkedRecordCachedName: '',
      linkedRecordId: '',
      linkedObjectMetadataId: '',
      workspaceMemberId: event.workspaceMemberId ?? '',
      properties: event.properties,
    })) satisfies TimelineActivity[];
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
            name: 'linked-' + eventName,
            workspaceMemberId: event.workspaceMemberId ?? '',
            recordId: activityTarget[targetColumn[0]],
            linkedRecordCachedName: correspondingActivity.title,
            linkedRecordId: correspondingActivity.id,
            linkedObjectMetadataId: event.objectMetadata.id,
            properties: event.properties,
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

        const activityObjectMetadataId = event.objectMetadata.fields.find(
          (field) => field.name === activityType,
        )?.relationTargetObjectMetadataId;

        if (!isDefined(activityObjectMetadataId)) {
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
          name: 'linked-' + eventName,
          objectName: targetColumnName.replace(/Id$/, ''),
          recordId: activityTarget[targetColumnName],
          linkedRecordCachedName: activity.title,
          linkedRecordId: activity.id,
          linkedObjectMetadataId: activityObjectMetadataId,
          workspaceMemberId: event.workspaceMemberId ?? '',
          properties: {},
        };
      })
      .filter(isDefined);
  }
}
