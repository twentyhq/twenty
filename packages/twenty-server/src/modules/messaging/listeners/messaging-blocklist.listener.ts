import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ObjectRecordCreateEvent } from 'src/engine/integrations/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/integrations/event-emitter/types/object-record-delete.event';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { BlocklistObjectMetadata } from 'src/modules/connected-account/standard-objects/blocklist.object-metadata';
import {
  BlocklistReimportMessagesJob,
  BlocklistReimportMessagesJobData,
} from 'src/modules/messaging/jobs/blocklist-reimport-messages.job';
import {
  BlocklistItemDeleteMessagesJobData,
  BlocklistItemDeleteMessagesJob,
} from 'src/modules/messaging/jobs/blocklist-item-delete-messages.job';

@Injectable()
export class MessagingBlocklistListener {
  constructor(
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('blocklist.created')
  async handleCreatedEvent(
    payload: ObjectRecordCreateEvent<BlocklistObjectMetadata>,
  ) {
    this.messageQueueService.add<BlocklistItemDeleteMessagesJobData>(
      BlocklistItemDeleteMessagesJob.name,
      {
        workspaceId: payload.workspaceId,
        blocklistItemId: payload.recordId,
      },
    );
  }

  @OnEvent('blocklist.deleted')
  async handleDeletedEvent(
    payload: ObjectRecordDeleteEvent<BlocklistObjectMetadata>,
  ) {
    await this.messageQueueService.add<BlocklistReimportMessagesJobData>(
      BlocklistReimportMessagesJob.name,
      {
        workspaceId: payload.workspaceId,
        workspaceMemberId: payload.properties.before.workspaceMember.id,
        handle: payload.properties.before.handle,
      },
    );
  }
}
