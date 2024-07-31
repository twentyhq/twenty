import { ObjectRecordBaseEvent } from 'src/engine/integrations/event-emitter/types/object-record.base.event';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
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
  async handle(data: ObjectRecordBaseEvent): Promise<void> {
    if (data.userId) {
      const workspaceMember = await this.workspaceMemberService.getByIdOrFail(
        data.userId,
        data.workspaceId,
      );

      data.workspaceMemberId = workspaceMember.id;
    }

    if (data.properties.diff) {
      // we remove "before" and "after" property for a cleaner/slimmer event payload
      data.properties = {
        diff: data.properties.diff,
      };
    }

    // Temporary
    // We ignore every that is not a LinkedObject or a Business Object
    if (
      data.objectMetadata.isSystem &&
      data.objectMetadata.nameSingular !== 'noteTarget' &&
      data.objectMetadata.nameSingular !== 'taskTarget'
    ) {
      return;
    }

    await this.timelineActivityService.upsertEvent(data);
  }
}
