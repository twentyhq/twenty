import { Injectable } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { LogEventRepository } from 'src/modules/event/repositiories/log-event.repository';
import { LogEventObjectMetadata } from 'src/modules/event/standard-objects/log-event.object-metadata';
import { WorkspaceMemberRepository } from 'src/modules/workspace-member/repositories/workspace-member.repository';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';

export type SaveEventToDbJobData = {
  workspaceId: string;
  recordId: string;
  userId: string | undefined;
  objectName: string;
  operation: string;
  details: any;
};

@Injectable()
export class SaveEventToDbJob implements MessageQueueJob<SaveEventToDbJobData> {
  constructor(
    @InjectObjectMetadataRepository(WorkspaceMemberObjectMetadata)
    private readonly workspaceMemberService: WorkspaceMemberRepository,
    @InjectObjectMetadataRepository(LogEventObjectMetadata)
    private readonly eventService: LogEventRepository,
  ) {}

  // TODO: need to support objects others than "person", "company", "opportunity"
  async handle(data: SaveEventToDbJobData): Promise<void> {
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

    await this.eventService.insert(
      `${data.operation}.${data.objectName}`,
      data.details,
      workspaceMemberId,
      data.objectName,
      data.recordId,
      data.workspaceId,
    );
  }
}
