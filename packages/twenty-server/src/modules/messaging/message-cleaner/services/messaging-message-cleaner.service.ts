import { Injectable } from '@nestjs/common';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { MessageThreadRepository } from 'src/modules/messaging/common/repositories/message-thread.repository';
import { MessageRepository } from 'src/modules/messaging/common/repositories/message.repository';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { deleteUsingPagination } from 'src/modules/messaging/message-cleaner/utils/delete-using-pagination.util';

@Injectable()
export class MessagingMessageCleanerService {
  constructor(
    @InjectObjectMetadataRepository(MessageWorkspaceEntity)
    private readonly messageRepository: MessageRepository,
    @InjectObjectMetadataRepository(MessageThreadWorkspaceEntity)
    private readonly messageThreadRepository: MessageThreadRepository,
  ) {}

  public async cleanWorkspaceThreads(workspaceId: string) {
    await deleteUsingPagination(
      workspaceId,
      500,
      this.messageRepository.getNonAssociatedMessageIdsPaginated.bind(
        this.messageRepository,
      ),
      this.messageRepository.deleteByIds.bind(this.messageRepository),
    );

    await deleteUsingPagination(
      workspaceId,
      500,
      this.messageThreadRepository.getOrphanThreadIdsPaginated.bind(
        this.messageThreadRepository,
      ),
      this.messageThreadRepository.deleteByIds.bind(
        this.messageThreadRepository,
      ),
    );
  }
}
