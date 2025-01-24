import { Injectable } from '@nestjs/common';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { ObjectRecordDestroyEvent } from 'src/engine/core-modules/event-emitter/types/object-record-destroy.event';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import {
  DeleteWorkspaceMemberConnectedAccountsCleanupJob,
  DeleteWorkspaceMemberConnectedAccountsCleanupJobData,
} from 'src/modules/connected-account/jobs/delete-workspace-member-connected-accounts.job';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class ConnectedAccountWorkspaceMemberListener {
  constructor(
    @InjectMessageQueue(MessageQueue.deleteCascadeQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.DESTROYED)
  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.DELETED)
  async handleWorkspaceMemberRemovalEvent(
    payload: WorkspaceEventBatch<
      | ObjectRecordDeleteEvent<WorkspaceMemberWorkspaceEntity>
      | ObjectRecordDestroyEvent<WorkspaceMemberWorkspaceEntity>
    >,
  ) {
    await Promise.all(
      payload.events.map((eventPayload) =>
        this.messageQueueService.add<DeleteWorkspaceMemberConnectedAccountsCleanupJobData>(
          DeleteWorkspaceMemberConnectedAccountsCleanupJob.name,
          {
            workspaceId: payload.workspaceId,
            workspaceMemberId: eventPayload.recordId,
          },
        ),
      ),
    );
  }
}
