import { Injectable } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { ObjectRecordBaseEvent } from 'src/engine/integrations/event-emitter/types/object-record.base.event';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { WorkspaceMemberRepository } from 'src/modules/workspace-member/repositories/workspace-member.repository';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { TimelineActivityService } from 'src/modules/timeline/services/timeline-activity.service';

@Injectable()
export class UpsertTimelineActivityFromInternalEvent
  implements MessageQueueJob<ObjectRecordBaseEvent>
{
  constructor(
    @InjectObjectMetadataRepository(WorkspaceMemberWorkspaceEntity)
    private readonly workspaceMemberService: WorkspaceMemberRepository,
    private readonly timelineActivityService: TimelineActivityService,
  ) {}

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
      data.objectMetadata.nameSingular !== 'activityTarget' &&
      data.objectMetadata.nameSingular !== 'activity'
    ) {
      return;
    }

    await this.timelineActivityService.upsertEvent(data);
  }
}
