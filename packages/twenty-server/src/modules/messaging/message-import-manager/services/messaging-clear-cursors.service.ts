import { Injectable, Logger } from '@nestjs/common';

import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';

@Injectable()
export class MessagingClearCursorsService {
  private readonly logger = new Logger(MessagingClearCursorsService.name);

  constructor(private readonly twentyORMManager: TwentyORMManager) {}

  async clearAllMessageChannelCursors(
    messageChannelId: string,
    transactionManager?: WorkspaceEntityManager,
  ): Promise<void> {
    this.logger.log(
      `MessageChannelId: ${messageChannelId} - Clearing all sync cursors`,
    );

    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    const messageFolderRepository =
      await this.twentyORMManager.getRepository<MessageFolderWorkspaceEntity>(
        'messageFolder',
      );

    await messageChannelRepository.update(
      { id: messageChannelId },
      { syncCursor: '' },
      transactionManager,
    );

    await messageFolderRepository.update(
      { messageChannelId },
      { syncCursor: '' },
      transactionManager,
    );

    this.logger.log(
      `MessageChannelId: ${messageChannelId} - Cleared all sync cursors`,
    );
  }
}
