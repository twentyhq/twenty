import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ObjectRecordDeleteEvent } from 'src/integrations/event-emitter/types/object-record-delete.event';
import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import {
  DeleteConnectedAccountAssociatedDataJobData,
  DeleteConnectedAccountAssociatedDataJob,
} from 'src/workspace/messaging/jobs/delete-connected-acount-associated-data.job';
import { ConnectedAccountObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/connected-account.object-metadata';

@Injectable()
export class MessagingConnectedAccountListener {
  constructor(
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('connectedAccount.deleted')
  handleDeletedEvent(
    payload: ObjectRecordDeleteEvent<ConnectedAccountObjectMetadata>,
  ) {
    this.messageQueueService.add<DeleteConnectedAccountAssociatedDataJobData>(
      DeleteConnectedAccountAssociatedDataJob.name,
      {
        workspaceId: payload.workspaceId,
        connectedAccountId: payload.deletedRecord.id,
      },
    );
  }
}
