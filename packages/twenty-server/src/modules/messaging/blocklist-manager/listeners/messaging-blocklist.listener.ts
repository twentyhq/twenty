import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ObjectRecordCreateEvent } from 'src/engine/integrations/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/integrations/event-emitter/types/object-record-delete.event';
import { ObjectRecordUpdateEvent } from 'src/engine/integrations/event-emitter/types/object-record-update.event';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { BlocklistWorkspaceEntity } from 'src/modules/connected-account/standard-objects/blocklist.workspace-entity';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  BlocklistItemDeleteMessagesJobData,
  BlocklistItemDeleteMessagesJob,
} from 'src/modules/messaging/blocklist-manager/jobs/messaging-blocklist-item-delete-messages.job';
import { MessageChannelRepository } from 'src/modules/messaging/common/repositories/message-channel.repository';
import { MessagingChannelSyncStatusService } from 'src/modules/messaging/common/services/messaging-channel-sync-status.service';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

@Injectable()
export class MessagingBlocklistListener {
  constructor(
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    private readonly messagingChannelSyncStatusService: MessagingChannelSyncStatusService,
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: MessageChannelRepository,
  ) {}

  @OnEvent('blocklist.created')
  async handleCreatedEvent(
    payload: ObjectRecordCreateEvent<BlocklistWorkspaceEntity>,
  ) {
    await this.messageQueueService.add<BlocklistItemDeleteMessagesJobData>(
      BlocklistItemDeleteMessagesJob.name,
      {
        workspaceId: payload.workspaceId,
        blocklistItemId: payload.recordId,
      },
    );
  }

  @OnEvent('blocklist.deleted')
  async handleDeletedEvent(
    payload: ObjectRecordDeleteEvent<BlocklistWorkspaceEntity>,
  ) {
    const workspaceMemberId = payload.properties.before.workspaceMember.id;
    const workspaceId = payload.workspaceId;

    const connectedAccount =
      await this.connectedAccountRepository.getAllByWorkspaceMemberId(
        workspaceMemberId,
        workspaceId,
      );

    if (!connectedAccount || connectedAccount.length === 0) {
      return;
    }

    const messageChannel =
      await this.messageChannelRepository.getByConnectedAccountId(
        connectedAccount[0].id,
        workspaceId,
      );

    await this.messagingChannelSyncStatusService.resetAndScheduleFullMessageListFetch(
      messageChannel[0].id,
      workspaceId,
    );
  }

  @OnEvent('blocklist.updated')
  async handleUpdatedEvent(
    payload: ObjectRecordUpdateEvent<BlocklistWorkspaceEntity>,
  ) {
    const workspaceMemberId = payload.properties.before.workspaceMember.id;
    const workspaceId = payload.workspaceId;

    await this.messageQueueService.add<BlocklistItemDeleteMessagesJobData>(
      BlocklistItemDeleteMessagesJob.name,
      {
        workspaceId,
        blocklistItemId: payload.recordId,
      },
    );

    const connectedAccount =
      await this.connectedAccountRepository.getAllByWorkspaceMemberId(
        workspaceMemberId,
        workspaceId,
      );

    if (!connectedAccount || connectedAccount.length === 0) {
      return;
    }

    const messageChannel =
      await this.messageChannelRepository.getByConnectedAccountId(
        connectedAccount[0].id,
        workspaceId,
      );

    await this.messagingChannelSyncStatusService.resetAndScheduleFullMessageListFetch(
      messageChannel[0].id,
      workspaceId,
    );
  }
}
