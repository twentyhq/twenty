import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { MessageChannelMessageAssociationRepository } from 'src/modules/messaging/repositories/message-channel-message-association.repository';
import { MessageRepository } from 'src/modules/messaging/repositories/message.repository';
import { MessageChannelMessageAssociationObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel-message-association.object-metadata';
import { MessageThreadObjectMetadata } from 'src/modules/messaging/standard-objects/message-thread.object-metadata';
import { MessageThreadRepository } from 'src/modules/messaging/repositories/message-thread.repository';
import { MessageObjectMetadata } from 'src/modules/messaging/standard-objects/message.object-metadata';

@Injectable()
export class MessageThreadService {
  constructor(
    @InjectObjectMetadataRepository(
      MessageChannelMessageAssociationObjectMetadata,
    )
    private readonly messageChannelMessageAssociationRepository: MessageChannelMessageAssociationRepository,
    @InjectObjectMetadataRepository(MessageObjectMetadata)
    private readonly messageRepository: MessageRepository,
    @InjectObjectMetadataRepository(MessageThreadObjectMetadata)
    private readonly messageThreadRepository: MessageThreadRepository,
  ) {}

  public async saveMessageThreadOrReturnExistingMessageThread(
    headerMessageId: string,
    messageThreadExternalId: string,
    workspaceId: string,
    manager: EntityManager,
  ) {
    // Check if message thread already exists via threadExternalId
    const existingMessageChannelMessageAssociationByMessageThreadExternalId =
      await this.messageChannelMessageAssociationRepository.getFirstByMessageThreadExternalId(
        messageThreadExternalId,
        workspaceId,
        manager,
      );

    const existingMessageThread =
      existingMessageChannelMessageAssociationByMessageThreadExternalId?.messageThreadId;

    if (existingMessageThread) {
      return Promise.resolve(existingMessageThread);
    }

    // Check if message thread already exists via existing message headerMessageId
    const existingMessageWithSameHeaderMessageId =
      await this.messageRepository.getFirstOrNullByHeaderMessageId(
        headerMessageId,
        workspaceId,
        manager,
      );

    if (existingMessageWithSameHeaderMessageId) {
      return Promise.resolve(
        existingMessageWithSameHeaderMessageId.messageThreadId,
      );
    }

    // If message thread does not exist, create new message thread
    const newMessageThreadId = v4();

    await this.messageThreadRepository.insert(
      newMessageThreadId,
      workspaceId,
      manager,
    );

    return Promise.resolve(newMessageThreadId);
  }
}
