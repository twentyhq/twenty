import { Injectable } from '@nestjs/common';

import { ObjectRecordNonDestructiveEvent } from 'src/engine/core-modules/event-emitter/types/object-record-non-destructive-event';
import { ObjectRecordBaseEvent } from 'src/engine/core-modules/event-emitter/types/object-record.base.event';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { TimelineActivityRepository } from 'src/modules/timeline/repositiories/timeline-activity.repository';
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
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  private targetObjects: Record<string, string> = {
    note: 'noteTarget',
    task: 'taskTarget',
  };

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

  private async getLinkedTimelineActivities({
    event,
    workspaceId,
    eventName,
  }: {
    event: ObjectRecordBaseEvent;
    workspaceId: string;
    eventName: string;
  }): Promise<TimelineActivity[] | undefined> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    switch (event.objectMetadata.nameSingular) {
      case 'noteTarget':
        return this.computeActivityTargets({
          event,
          dataSourceSchema,
          activityType: 'note',
          eventName,
          workspaceId,
        });
      case 'taskTarget':
        return this.computeActivityTargets({
          event,
          dataSourceSchema,
          activityType: 'task',
          eventName,
          workspaceId,
        });
      case 'note':
      case 'task':
        return this.computeActivities({
          event,
          dataSourceSchema,
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
    dataSourceSchema,
    activityType,
    eventName,
    workspaceId,
  }: {
    event: ObjectRecordBaseEvent;
    dataSourceSchema: string;
    activityType: string;
    eventName: string;
    workspaceId: string;
  }) {
    const activityTargets =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT * FROM ${dataSourceSchema}."${this.targetObjects[activityType]}"
         WHERE "${activityType}Id" = $1`,
        [event.recordId],
        workspaceId,
      );

    const activity = await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."${activityType}"
       WHERE "id" = $1`,
      [event.recordId],
      workspaceId,
    );

    if (activityTargets.length === 0) return;
    if (activity.length === 0) return;

    return (
      activityTargets
        // @ts-expect-error legacy noImplicitAny
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
            linkedRecordCachedName: activity[0].title,
            linkedRecordId: activity[0].id,
            linkedObjectMetadataId: event.objectMetadata.id,
          } satisfies TimelineActivity;
        })
        // @ts-expect-error legacy noImplicitAny
        .filter((event): event is TimelineActivity => event !== undefined)
    );
  }

  private async computeActivityTargets({
    event,
    dataSourceSchema,
    activityType,
    eventName,
    workspaceId,
  }: {
    event: ObjectRecordBaseEvent;
    dataSourceSchema: string;
    activityType: string;
    eventName: string;
    workspaceId: string;
  }): Promise<TimelineActivity[] | undefined> {
    const activityTarget =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT * FROM ${dataSourceSchema}."${this.targetObjects[activityType]}"
         WHERE "id" = $1`,
        [event.recordId],
        workspaceId,
      );

    if (activityTarget.length === 0) return;

    const activity = await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."${activityType}"
       WHERE "id" = $1`,
      [activityTarget[0].activityId],
      workspaceId,
    );

    if (activity.length === 0) return;

    const activityObjectMetadataId = event.objectMetadata.fields.find(
      (field) => field.name === activityType,
    )?.toRelationMetadata?.fromObjectMetadataId;

    const targetColumn: string[] = Object.entries(activityTarget[0])
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
        recordId: activityTarget[0][targetColumn[0]],
        linkedRecordCachedName: activity[0].title,
        linkedRecordId: activity[0].id,
        linkedObjectMetadataId: activityObjectMetadataId,
      } satisfies TimelineActivity,
    ];
  }
}
