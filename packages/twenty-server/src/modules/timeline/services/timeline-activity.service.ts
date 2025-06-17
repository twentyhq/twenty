import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ObjectRecordNonDestructiveEvent } from 'src/engine/core-modules/event-emitter/types/object-record-non-destructive-event';
import { ObjectRecordBaseEvent } from 'src/engine/core-modules/event-emitter/types/object-record.base.event';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { TimelineActivityRepository } from 'src/modules/timeline/repositories/timeline-activity.repository';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

type TimelineActivity = Omit<ObjectRecordNonDestructiveEvent, 'properties'> & {
  name: string;
  objectName?: string;
  linkedRecordCachedName?: string;
  linkedRecordId?: string;
  linkedObjectMetadataId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: Record<string, any>; // more relaxed conditions than for internal events
};

@Injectable()
export class TimelineActivityService {
  constructor(
    @InjectObjectMetadataRepository(TimelineActivityWorkspaceEntity)
    private readonly timelineActivityRepository: TimelineActivityRepository,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  private targetObjects: Record<string, string> = {
    note: 'noteTarget',
    task: 'taskTarget',
  };

  // Core business objects that should always have timeline activities
  private readonly coreBusinessObjects = [
    'company',
    'person',
    'note',
    'task',
    'opportunity',
  ];

  async upsertEvent({
    event,
    eventName,
    workspaceId,
  }: {
    event: ObjectRecordBaseEvent;
    eventName: string;
    workspaceId: string;
  }) {
    const timelineActivities = await this.transformEventToTimelineActivities({
      event,
      workspaceId,
      eventName,
    });

    if (!timelineActivities || timelineActivities.length === 0) return;

    for (const timelineActivity of timelineActivities) {
      await this.timelineActivityRepository.upsertOne(
        timelineActivity.name,
        timelineActivity.properties,
        timelineActivity.objectName ?? event.objectMetadata.nameSingular,
        timelineActivity.recordId,
        workspaceId,
        timelineActivity.workspaceMemberId,
        timelineActivity.linkedRecordCachedName,
        timelineActivity.linkedRecordId,
        timelineActivity.linkedObjectMetadataId,
      );
    }
  }

  private async transformEventToTimelineActivities({
    event,
    workspaceId,
    eventName,
  }: {
    event: ObjectRecordBaseEvent;
    workspaceId: string;
    eventName: string;
  }): Promise<TimelineActivity[] | undefined> {
    // Handle core business object creation events
    if (this.coreBusinessObjects.includes(event.objectMetadata.nameSingular)) {
      return await this.handleCoreBusinessObjectEvent({
        event,
        workspaceId,
        eventName,
      });
    }

    if (['note', 'task'].includes(event.objectMetadata.nameSingular)) {
      const linkedTimelineActivities = await this.getLinkedTimelineActivities({
        event,
        workspaceId,
        eventName,
      });

      // 2 timelines, one for the linked object and one for the task/note
      if (linkedTimelineActivities && linkedTimelineActivities?.length > 0)
        return [
          ...linkedTimelineActivities,
          { ...event, name: eventName },
        ] satisfies TimelineActivity[];
    }

    if (
      ['noteTarget', 'taskTarget', 'messageParticipant'].includes(
        event.objectMetadata.nameSingular,
      )
    ) {
      return await this.getLinkedTimelineActivities({
        event,
        workspaceId,
        eventName,
      });
    }

    return [{ ...event, name: eventName }] satisfies TimelineActivity[];
  }

  /**
   * Handles timeline activity creation for core business objects
   * Creates timeline activities for company, person, note, task, and opportunity events
   */
  private async handleCoreBusinessObjectEvent({
    event,
    workspaceId,
    eventName,
  }: {
    event: ObjectRecordBaseEvent;
    workspaceId: string;
    eventName: string;
  }): Promise<TimelineActivity[]> {
    const objectName = event.objectMetadata.nameSingular;
    const timelineActivities: TimelineActivity[] = [];

    // Create main timeline activity for the object itself
    const mainActivity: TimelineActivity = {
      ...event,
      name: eventName,
      linkedRecordCachedName: await this.getRecordName(event, workspaceId),
    };

    timelineActivities.push(mainActivity);

    // For note and task, also create linked timeline activities
    if (['note', 'task'].includes(objectName)) {
      const linkedActivities = await this.getLinkedTimelineActivities({
        event,
        workspaceId,
        eventName,
      });

      if (linkedActivities && linkedActivities.length > 0) {
        timelineActivities.push(...linkedActivities);
      }
    }

    return timelineActivities;
  }

  /**
   * Gets a human-readable name for the record to cache in timeline activity
   */
  private async getRecordName(
    event: ObjectRecordBaseEvent,
    workspaceId: string,
  ): Promise<string> {
    try {
      const repository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace(
          workspaceId,
          event.objectMetadata.nameSingular,
          {
            shouldBypassPermissionChecks: true,
          },
        );

      const record = await repository.findOneBy({ id: event.recordId });

      if (!record)
        return `${event.objectMetadata.labelSingular} ${event.recordId}`;

      // Try to get the most appropriate display name based on object type
      switch (event.objectMetadata.nameSingular) {
        case 'company':
          return record.name || `Company ${event.recordId}`;
        case 'person': {
          const firstName = record.name?.firstName || '';
          const lastName = record.name?.lastName || '';

          return (
            `${firstName} ${lastName}`.trim() || `Person ${event.recordId}`
          );
        }
        case 'note':
          return record.title || `Note ${event.recordId}`;
        case 'task':
          return record.title || `Task ${event.recordId}`;
        case 'opportunity':
          return record.name || `Opportunity ${event.recordId}`;
        default:
          return `${event.objectMetadata.labelSingular} ${event.recordId}`;
      }
    } catch (error) {
      // Fallback to a basic name if we can't fetch the record
      return `${event.objectMetadata.labelSingular} ${event.recordId}`;
    }
  }

  private async getLinkedTimelineActivities({
    event,
    workspaceId,
    eventName,
  }: {
    event: ObjectRecordBaseEvent;
    workspaceId: string;
    eventName: string;
  }): Promise<TimelineActivity[] | undefined> {
    switch (event.objectMetadata.nameSingular) {
      case 'noteTarget':
        return this.computeActivityTargets({
          event,
          activityType: 'note',
          eventName,
          workspaceId,
        });
      case 'taskTarget':
        return this.computeActivityTargets({
          event,
          activityType: 'task',
          eventName,
          workspaceId,
        });
      case 'note':
      case 'task':
        return this.computeActivities({
          event,
          activityType: event.objectMetadata.nameSingular,
          eventName,
          workspaceId,
        });
      default:
        return [];
    }
  }

  private async computeActivities({
    event,
    activityType,
    eventName,
    workspaceId,
  }: {
    event: ObjectRecordBaseEvent;
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
        [activityType + 'Id']: event.recordId,
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

    const activity = await activityRepository.findOneBy({
      id: event.recordId,
    });

    if (activityTargets.length === 0) return;
    if (!isDefined(activity)) return;

    return activityTargets
      .map((activityTarget) => {
        const targetColumn: string[] = Object.entries(activityTarget)
          .map(([columnName, columnValue]: [string, string]) => {
            if (
              columnName === activityType + 'Id' ||
              !columnName.endsWith('Id')
            )
              return;
            if (columnValue === null) return;

            return columnName;
          })
          .filter((column): column is string => column !== undefined);

        if (targetColumn.length === 0) return;

        return {
          ...event,
          name: 'linked-' + eventName,
          objectName: targetColumn[0].replace(/Id$/, ''),
          recordId: activityTarget[targetColumn[0]],
          linkedRecordCachedName: activity.title,
          linkedRecordId: activity.id,
          linkedObjectMetadataId: event.objectMetadata.id,
        } satisfies TimelineActivity;
      })
      .filter(
        // @ts-expect-error legacy noImplicitAny
        (event): event is TimelineActivity => event !== undefined,
      ) as TimelineActivity[];
  }

  private async computeActivityTargets({
    event,
    activityType,
    eventName,
    workspaceId,
  }: {
    event: ObjectRecordBaseEvent;
    activityType: 'task' | 'note';
    eventName: string;
    workspaceId: string;
  }): Promise<TimelineActivity[] | undefined> {
    const activityTargetRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        this.targetObjects[activityType],
        {
          shouldBypassPermissionChecks: true,
        },
      );

    const activityTarget = await activityTargetRepository.findOneBy({
      id: event.recordId,
    });

    if (!isDefined(activityTarget)) return;

    const activityRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        activityType,
        {
          shouldBypassPermissionChecks: true,
        },
      );

    const activity = await activityRepository.findOneBy({
      id: activityTarget.activityId,
    });

    if (!isDefined(activity)) return;

    const activityObjectMetadataId = event.objectMetadata.fields.find(
      (field) => field.name === activityType,
    )?.relationTargetObjectMetadataId;

    const targetColumn: string[] = Object.entries(activityTarget)
      .map(([columnName, columnValue]: [string, string]) => {
        if (columnName === activityType + 'Id' || !columnName.endsWith('Id'))
          return;
        if (columnValue === null) return;

        return columnName;
      })
      .filter((column): column is string => column !== undefined);

    if (targetColumn.length === 0) return;

    return [
      {
        ...event,
        name: 'linked-' + eventName,
        properties: {},
        objectName: targetColumn[0].replace(/Id$/, ''),
        recordId: activityTarget[targetColumn[0]],
        linkedRecordCachedName: activity.title,
        linkedRecordId: activity.id,
        linkedObjectMetadataId: activityObjectMetadataId,
      } satisfies TimelineActivity,
    ];
  }
}
