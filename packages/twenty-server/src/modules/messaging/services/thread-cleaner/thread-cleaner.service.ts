import { Injectable } from '@nestjs/common';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { MessageThreadRepository } from 'src/modules/messaging/repositories/message-thread.repository';
import { MessageRepository } from 'src/modules/messaging/repositories/message.repository';
import { deleteUsingPagination } from 'src/modules/messaging/services/thread-cleaner/utils/delete-using-pagination.util';
import { MessageThreadObjectMetadata } from 'src/modules/messaging/standard-objects/message-thread.object-metadata';
import { MessageObjectMetadata } from 'src/modules/messaging/standard-objects/message.object-metadata';

@Injectable()
export class ThreadCleanerService {
  constructor(
    @InjectObjectMetadataRepository(MessageObjectMetadata)
    private readonly messageRepository: MessageRepository,
    @InjectObjectMetadataRepository(MessageThreadObjectMetadata)
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
