import { ObjectRecordEvent } from 'src/engine/core-modules/event-emitter/types/object-record-event.event';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { AuditLogRepository } from 'src/modules/timeline/repositiories/audit-log.repository';
import { AuditLogWorkspaceEntity } from 'src/modules/timeline/standard-objects/audit-log.workspace-entity';
import { WorkspaceMemberRepository } from 'src/modules/workspace-member/repositories/workspace-member.repository';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Processor(MessageQueue.entityEventsToDbQueue)
export class CreateAuditLogFromInternalEvent {
  constructor(
    @InjectObjectMetadataRepository(WorkspaceMemberWorkspaceEntity)
    private readonly workspaceMemberService: WorkspaceMemberRepository,
    @InjectObjectMetadataRepository(AuditLogWorkspaceEntity)
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  @Process(CreateAuditLogFromInternalEvent.name)
  async handle(
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>,
  ): Promise<void> {
    for (const eventData of workspaceEventBatch.events) {
      let workspaceMemberId: string | null = null;

      if (eventData.userId) {
        const workspaceMember = await this.workspaceMemberService.getByIdOrFail(
          eventData.userId,
          workspaceEventBatch.workspaceId,
        );

        workspaceMemberId = workspaceMember.id;
      }

      await this.auditLogRepository.insert(
        workspaceEventBatch.name,
        'diff' in eventData.properties
          ? {
              // we remove "before" and "after" property for a cleaner/slimmer event payload
              diff: eventData.properties.diff,
            }
          : eventData.properties,
        workspaceMemberId,
        workspaceEventBatch.name.split('.')[0],
        eventData.objectMetadata.id,
        eventData.recordId,
        workspaceEventBatch.workspaceId,
      );
    }
  }
}
