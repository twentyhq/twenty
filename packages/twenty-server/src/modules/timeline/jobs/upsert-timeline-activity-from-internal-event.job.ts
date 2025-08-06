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

    const userIds = workspaceEventBatch.events.map((event) => event.userId);
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

    // Temporary
    // We ignore every that is not a LinkedObject or a Business Object
    const filteredEvents = workspaceEventBatch.events.filter((event) => {
      return (
        !event.objectMetadata.isSystem ||
        event.objectMetadata.nameSingular === 'noteTarget' ||
        event.objectMetadata.nameSingular === 'taskTarget'
      );
    });

    await this.timelineActivityService.upsertEvents({
      events: filteredEvents.map((event) =>
        'diff' in event.properties && event.properties.diff
          ? {
              ...event,
              properties: {
                diff: event.properties.diff,
              },
            }
          : event,
      ),
      eventName: workspaceEventBatch.name,
      workspaceId: workspaceEventBatch.workspaceId,
    });
  }
}
