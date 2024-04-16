import { Injectable } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { ObjectRecordBaseEvent } from 'src/engine/integrations/event-emitter/types/object-record.base.event';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { WorkspaceMemberRepository } from 'src/modules/workspace-member/repositories/workspace-member.repository';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';
import { TimelineActivityRepository } from 'src/modules/event/repositiories/timeline-activity.repository';
import { TimelineActivityObjectMetadata } from 'src/modules/event/standard-objects/timeline-activity.object-metadata';

@Injectable()
export class UpsertTimelineActivityFromInternalEvent
  implements MessageQueueJob<ObjectRecordBaseEvent>
{
  constructor(
    @InjectObjectMetadataRepository(WorkspaceMemberObjectMetadata)
    private readonly workspaceMemberService: WorkspaceMemberRepository,
    @InjectObjectMetadataRepository(TimelineActivityObjectMetadata)
    private readonly timelineActivityRepository: TimelineActivityRepository,
  ) {}

  async handle(data: ObjectRecordBaseEvent): Promise<void> {
    let workspaceMemberId: string | null = null;

    if (data.userId) {
      const workspaceMember = await this.workspaceMemberService.getByIdOrFail(
        data.userId,
        data.workspaceId,
      );

      workspaceMemberId = workspaceMember.id;
    }

    if (data.details.diff) {
      // we remove "before" and "after" property for a cleaner/slimmer event payload
      data.details = {
        diff: data.details.diff,
      };
    }

    // If data.objectMetadata.nameSingular is not activityTarget, company
    if (
      data.objectMetadata.isSystem &&
      data.objectMetadata.nameSingular !== 'activityTarget' &&
      data.objectMetadata.nameSingular !== 'activity'
    ) {
      return;
    }

    await this.timelineActivityRepository.upsert(
      data.name,
      data.details,
      workspaceMemberId,
      data.objectMetadata,
      data.recordId,
      data.workspaceId,
    );
  }
}
