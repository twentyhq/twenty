import { Injectable } from '@nestjs/common';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel.repository';
import {
  MessageChannelWorkspaceEntity,
  MessageChannelSyncSubStatus,
  MessageChannelSyncStatus,
} from 'src/modules/messaging/standard-objects/message-channel.workspace-entity';

@Injectable()
export class SetMessageChannelSyncStatusService {
  constructor(
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: MessageChannelRepository,
  ) {}

  public async setMessageListFetchOnGoingStatus(
    messageChannelId: string,
    workspaceId: string,
  ) {
    await this.messageChannelRepository.updateSyncSubStatus(
      messageChannelId,
      MessageChannelSyncSubStatus.MESSAGES_LIST_FETCH_ONGOING,
      workspaceId,
    );

    await this.messageChannelRepository.updateSyncStatus(
      messageChannelId,
      MessageChannelSyncStatus.ONGOING,
      workspaceId,
    );
  }

  public async setFullMessageListFetchPendingStatus(
    messageChannelId: string,
    workspaceId: string,
  ) {
    await this.messageChannelRepository.updateSyncSubStatus(
      messageChannelId,
      MessageChannelSyncSubStatus.FULL_MESSAGES_LIST_FETCH_PENDING,
      workspaceId,
    );
  }

  public async setCompletedStatus(
    messageChannelId: string,
    workspaceId: string,
  ) {
    await this.messageChannelRepository.updateSyncSubStatus(
      messageChannelId,
      MessageChannelSyncSubStatus.PARTIAL_MESSAGES_LIST_FETCH_PENDING,
      workspaceId,
    );

    await this.messageChannelRepository.updateSyncStatus(
      messageChannelId,
      MessageChannelSyncStatus.COMPLETED,
      workspaceId,
    );
  }

  public async setMessagesImportPendingStatus(
    messageChannelId: string,
    workspaceId: string,
  ) {
    await this.messageChannelRepository.updateSyncSubStatus(
      messageChannelId,
      MessageChannelSyncSubStatus.MESSAGES_IMPORT_PENDING,
      workspaceId,
    );
  }

  public async setMessagesImportOnGoingStatus(
    messageChannelId: string,
    workspaceId: string,
  ) {
    await this.messageChannelRepository.updateSyncSubStatus(
      messageChannelId,
      MessageChannelSyncSubStatus.MESSAGES_IMPORT_ONGOING,
      workspaceId,
    );
  }

  public async setFailedUnkownStatus(
    messageChannelId: string,
    workspaceId: string,
  ) {
    await this.messageChannelRepository.updateSyncSubStatus(
      messageChannelId,
      MessageChannelSyncSubStatus.FAILED,
      workspaceId,
    );

    await this.messageChannelRepository.updateSyncStatus(
      messageChannelId,
      MessageChannelSyncStatus.FAILED_UNKNOWN,
      workspaceId,
    );
  }
}
