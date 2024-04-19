import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ObjectRecordCreateEvent } from 'src/engine/integrations/event-emitter/types/object-record-create.event';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { BlocklistObjectMetadata } from 'src/modules/connected-account/standard-objects/blocklist.object-metadata';
import {
  BlocklistReimportMessagesJob,
  BlocklistReimportMessagesJobData,
} from 'src/modules/messaging/jobs/blocklist-reimport-messages.job';
import {
  DeleteMessagesFromHandleJobData,
  DeleteMessagesFromHandleJob,
} from 'src/modules/messaging/jobs/delete-messages-from-handle.job';

@Injectable()
export class MessagingBlocklistListener {
  constructor(
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('blocklist.created')
  handleCreatedEvent(
    payload: ObjectRecordCreateEvent<BlocklistObjectMetadata>,
  ) {
    this.messageQueueService.add<DeleteMessagesFromHandleJobData>(
      DeleteMessagesFromHandleJob.name,
      {
        workspaceId: payload.workspaceId,
        blocklistItemId: payload.recordId,
      },
    );
  }

  @OnEvent('blocklist.deleted')
  handleDeletedEvent(
    payload: ObjectRecordCreateEvent<BlocklistObjectMetadata>,
  ) {
    this.messageQueueService.add<BlocklistReimportMessagesJobData>(
      BlocklistReimportMessagesJob.name,
      {
        workspaceId: payload.workspaceId,
        blocklistItemId: payload.recordId,
      },
    );
  }
}
