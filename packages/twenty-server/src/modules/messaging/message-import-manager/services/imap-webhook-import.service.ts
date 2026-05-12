import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MessagingMessagesImportService } from './messaging-messages-import.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

@Injectable()
export class ImapWebhookImportService {
  private readonly logger = new Logger(ImapWebhookImportService.name);

  constructor(
    private readonly messagingMessagesImportService: MessagingMessagesImportService,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
  ) {}

  async triggerImportFromWebhook(workspaceId: string, messageChannelId: string): Promise<void> {
    const messageChannel = await this.messageChannelRepository.findOne({
      where: { id: messageChannelId },
      relations: ['connectedAccount'],
    });

    if (!messageChannel) {
      throw new Error('Message channel not found');
    }

    this.logger.log(`Triggering IMAP import for channel ${messageChannelId} via webhook`);
    
    await this.messagingMessagesImportService.processMessageBatchImport(
      messageChannel,
      messageChannel.connectedAccount,
      workspaceId,
    );
  }
}
