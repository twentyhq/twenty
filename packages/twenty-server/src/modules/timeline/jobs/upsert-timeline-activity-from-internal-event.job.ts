import { ObjectRecordBaseEvent } from 'src/engine/core-modules/event-emitter/types/object-record.base.event';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/workspace-event.type';
import { TimelineActivityService } from 'src/modules/timeline/services/timeline-activity.service';
import { WorkspaceMemberRepository } from 'src/modules/workspace-member/repositories/workspace-member.repository';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Processor(MessageQueue.entityEventsToDbQueue)
export class UpsertTimelineActivityFromInternalEvent {
  constructor(
    @InjectObjectMetadataRepository(WorkspaceMemberWorkspaceEntity)
    private readonly workspaceMemberService: WorkspaceMemberRepository,
    private readonly timelineActivityService: TimelineActivityService,
  ) {}

  @Process(UpsertTimelineActivityFromInternalEvent.name)
  async handle(
    data: WorkspaceEventBatch<ObjectRecordBaseEvent>,
  ): Promise<void> {
    for (const eventData of data.events) {
      if (eventData.userId) {
        const workspaceMember = await this.workspaceMemberService.getByIdOrFail(
          eventData.userId,
          data.workspaceId,
        );

        eventData.workspaceMemberId = workspaceMember.id;
      }

      if (eventData.properties.diff) {
        // we remove "before" and "after" property for a cleaner/slimmer event payload
        eventData.properties = {
          diff: eventData.properties.diff,
        };
      }

      // Temporary
      // We ignore every that is not a LinkedObject or a Business Object
      if (
        eventData.objectMetadata.isSystem &&
        eventData.objectMetadata.nameSingular !== 'noteTarget' &&
        eventData.objectMetadata.nameSingular !== 'taskTarget'
      ) {
        continue;
      }

      await this.timelineActivityService.upsertEvent({
        ...eventData,
        workspaceId: data.workspaceId,
        name: data.name,
      });
    }
  }
}
