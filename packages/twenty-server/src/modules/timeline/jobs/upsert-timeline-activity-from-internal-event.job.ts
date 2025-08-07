import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { ObjectRecordNonDestructiveEvent } from 'src/engine/core-modules/event-emitter/types/object-record-non-destructive-event';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { TimelineActivityService } from 'src/modules/timeline/services/timeline-activity.service';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Processor(MessageQueue.entityEventsToDbQueue)
export class UpsertTimelineActivityFromInternalEvent {
  constructor(
    private readonly timelineActivityService: TimelineActivityService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  @Process(UpsertTimelineActivityFromInternalEvent.name)
  async handle(
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordNonDestructiveEvent>,
  ): Promise<void> {
    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceEventBatch.workspaceId,
        WorkspaceMemberWorkspaceEntity,
        {
          shouldBypassPermissionChecks: true,
        },
      );

    const userIds = workspaceEventBatch.events
      .map((event) => event.userId)
      .filter(isDefined);

    const workspaceMembers = await workspaceMemberRepository.findBy({
      userId: In(userIds),
    });

    for (const eventData of workspaceEventBatch.events) {
      const workspaceMember = workspaceMembers.find(
        (workspaceMember) => workspaceMember.userId === eventData.userId,
      );

      if (eventData.userId && workspaceMember) {
        eventData.workspaceMemberId = workspaceMember.id;
      }
    }

    const filteredEvents = workspaceEventBatch.events
      .filter((event) => {
        return (
          !event.objectMetadata.isSystem ||
          event.objectMetadata.nameSingular === 'noteTarget' ||
          event.objectMetadata.nameSingular === 'taskTarget'
        );
      })
      .map((event) => {
        if ('diff' in event.properties && event.properties.diff) {
          return {
            ...event,
            properties: {
              diff: event.properties.diff,
            },
          };
        }

        return event;
      });

    if (filteredEvents.length === 0) {
      return;
    }

    await this.timelineActivityService.upsertEvents({
      events: filteredEvents,
      eventName: workspaceEventBatch.name,
      workspaceId: workspaceEventBatch.workspaceId,
    });
  }
}
