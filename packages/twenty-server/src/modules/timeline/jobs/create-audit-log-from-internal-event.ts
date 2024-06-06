import { ObjectRecordBaseEvent } from 'src/engine/integrations/event-emitter/types/object-record.base.event';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { AuditLogRepository } from 'src/modules/timeline/repositiories/audit-log.repository';
import { AuditLogWorkspaceEntity } from 'src/modules/timeline/standard-objects/audit-log.workspace-entity';
import { WorkspaceMemberRepository } from 'src/modules/workspace-member/repositories/workspace-member.repository';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';

@Processor(MessageQueue.entityEventsToDbQueue)
export class CreateAuditLogFromInternalEvent {
  constructor(
    @InjectObjectMetadataRepository(WorkspaceMemberWorkspaceEntity)
    private readonly workspaceMemberService: WorkspaceMemberRepository,
    @InjectObjectMetadataRepository(AuditLogWorkspaceEntity)
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  @Process(CreateAuditLogFromInternalEvent.name)
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

    await this.auditLogRepository.insert(
      data.name,
      data.properties,
      workspaceMemberId,
      data.name.split('.')[0],
      data.objectMetadata.id,
      data.recordId,
      data.workspaceId,
    );
  }
}
