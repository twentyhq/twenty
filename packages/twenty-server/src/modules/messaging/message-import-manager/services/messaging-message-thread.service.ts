import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { MessageChannelMessageAssociationRepository } from 'src/modules/messaging/common/repositories/message-channel-message-association.repository';
import { MessageThreadRepository } from 'src/modules/messaging/common/repositories/message-thread.repository';
import { MessageRepository } from 'src/modules/messaging/common/repositories/message.repository';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageThreadSubscriberWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread-subscriber.workspace-entity';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

@Injectable()
export class MessagingMessageThreadService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    @InjectObjectMetadataRepository(
      MessageChannelMessageAssociationWorkspaceEntity,
    )
    private readonly messageChannelMessageAssociationRepository: MessageChannelMessageAssociationRepository,
    @InjectObjectMetadataRepository(MessageWorkspaceEntity)
    private readonly messageRepository: MessageRepository,
    @InjectObjectMetadataRepository(MessageThreadWorkspaceEntity)
    private readonly messageThreadRepository: MessageThreadRepository,
  ) {}

  public async saveMessageThreadMember(
    messageThreadId: string,
    workspaceMemberId: string,
  ) {
    const id = v4();

    const messageThreadSubscriberRepository =
      await this.twentyORMManager.getRepository<MessageThreadSubscriberWorkspaceEntity>(
        'messageThreadSubscriber',
      );

    await messageThreadSubscriberRepository.insert({
      id,
      messageThreadId,
      workspaceMemberId,
    });
  }

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
