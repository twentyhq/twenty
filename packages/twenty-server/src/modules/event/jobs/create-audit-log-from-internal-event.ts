import { Injectable } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { ObjectRecordBaseEvent } from 'src/engine/integrations/event-emitter/types/object-record.base.event';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { AuditLogRepository } from 'src/modules/event/repositiories/audit-log.repository';
import { AuditLogObjectMetadata } from 'src/modules/event/standard-objects/audit-log.object-metadata';
import { WorkspaceMemberRepository } from 'src/modules/workspace-member/repositories/workspace-member.repository';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';

@Injectable()
export class CreateAuditLogFromInternalEvent
  implements MessageQueueJob<ObjectRecordBaseEvent>
{
  constructor(
    @InjectObjectMetadataRepository(WorkspaceMemberObjectMetadata)
    private readonly workspaceMemberService: WorkspaceMemberRepository,
    @InjectObjectMetadataRepository(AuditLogObjectMetadata)
    private readonly auditLogService: AuditLogRepository,
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

    if (data.properties.diff) {
      // we remove "before" and "after" property for a cleaner/slimmer event payload
      data.properties = {
        diff: data.properties.diff,
      };
    }

    await this.auditLogService.insert(
      data.name,
      data.properties,
      workspaceMemberId,
      data.name.split('.')[0],
      data.recordId,
      data.workspaceId,
    );
  }
}
