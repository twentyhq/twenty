import { Injectable, Scope } from '@nestjs/common';

import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import {
  BlocklistItemDeleteMessagesJob,
  BlocklistItemDeleteMessagesJobData,
} from 'src/modules/messaging/blocklist-manager/jobs/messaging-blocklist-item-delete-messages.job';
import {
  BlocklistReimportMessagesJob,
  BlocklistReimportMessagesJobData,
} from 'src/modules/messaging/blocklist-manager/jobs/messaging-blocklist-reimport-messages.job';
import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';

@Injectable({ scope: Scope.REQUEST })
export class MessagingBlocklistListener {
  constructor(
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnDatabaseBatchEvent('blocklist', DatabaseEventAction.CREATED)
  async handleCreatedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordCreateEvent<BlocklistWorkspaceEntity>
    >,
  ) {
    await this.messageQueueService.add<BlocklistItemDeleteMessagesJobData>(
      BlocklistItemDeleteMessagesJob.name,
      payload,
    );
  }

  @OnDatabaseBatchEvent('blocklist', DatabaseEventAction.CREATED)
  async handleDeletedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordDeleteEvent<BlocklistWorkspaceEntity>
    >,
  ) {
    await this.messageQueueService.add<BlocklistReimportMessagesJobData>(
      BlocklistReimportMessagesJob.name,
      payload,
    );
  }

  @OnDatabaseBatchEvent('blocklist', DatabaseEventAction.UPDATED)
  async handleUpdatedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<BlocklistWorkspaceEntity>
    >,
  ) {
    await this.messageQueueService.add<BlocklistItemDeleteMessagesJobData>(
      BlocklistItemDeleteMessagesJob.name,
      payload,
    );

    await this.messageQueueService.add<BlocklistReimportMessagesJobData>(
      BlocklistReimportMessagesJob.name,
      payload,
    );
  }
}
