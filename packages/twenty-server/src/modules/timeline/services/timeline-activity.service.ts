import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { ObjectRecordBaseEvent } from 'src/engine/core-modules/event-emitter/types/object-record.base.event';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { parseEventNameOrThrow } from 'src/engine/workspace-event-emitter/utils/parse-event-name';
import { TimelineActivityRepository } from 'src/modules/timeline/repositories/timeline-activity.repository';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { TimelineActivityPayload } from 'src/modules/timeline/types/timeline-activity-payload';

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

    const timelineActivities =
      await this.transformEventsToTimelineActivityPayloads({
        events,
        workspaceId,
        eventName,
      });

    if (!timelineActivities || timelineActivities.length === 0) {
      return;
    }

    this.timelineActivityRepository.upsertTimelineActivities({
      payloads: timelineActivities,
      objectSingularName,
      workspaceId,
    });
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
            objectSingularName: event.objectMetadata.nameSingular,
          };
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
          objectSingularName: targetColumnName.replace(/Id$/, ''),
          recordId: activityTarget[targetColumnName],
          linkedRecordCachedName: activity.title,
          linkedRecordId: activity.id,
          linkedObjectMetadataId: activityObjectMetadataId,
          workspaceMemberId: event.workspaceMemberId,
          properties: {},
        };
      })
      .filter(isDefined);
  }
}
