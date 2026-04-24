import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ImapClientService } from './imap-client.service';
import { ImapConfig, ImapMessage, SyncOptions } from '../interfaces/imap-config.interface';
import { MessageChannelObjectMetadata } from 'src/modules/messaging/common/standard-objects/message-channel.object-metadata';
import { MessageObjectMetadata } from 'src/modules/messaging/common/standard-objects/message.object-metadata';

interface SyncState {
  lastSyncAt: Date;
  lastUid: number;
  uidValidity: number;
  totalSynced: number;
}

@Injectable()
export class ImapSyncService {
  private readonly logger = new Logger(ImapSyncService.name);
  private readonly DEFAULT_BATCH_SIZE = 50;

  constructor(
    private readonly imapClient: ImapClientService,
    @InjectRepository(MessageChannelObjectMetadata)
    private readonly messageChannelRepository: Repository<MessageChannelObjectMetadata>,
    @InjectRepository(MessageObjectMetadata)
    private readonly messageRepository: Repository<MessageObjectMetadata>,
  ) {}

  async syncMailbox(
    config: ImapConfig,
    channelId: string,
    options: SyncOptions = {},
  ): Promise<{ synced: number; errors: number }> {
    const batchSize = options.batchSize || this.DEFAULT_BATCH_SIZE;
    let synced = 0;
    let errors = 0;

    try {
      // 获取文件夹列表
      const folders = await this.imapClient.getFolders(config);
      
      // 过滤主要邮件夹（收件箱、已发送等）
      const mainFolders = this.filterMainFolders(folders);

      for (const folder of mainFolders) {
        try {
          const result = await this.syncFolder(config, channelId, folder, {
            ...options,
            batchSize,
          });
          synced += result.synced;
          errors += result.errors;
        } catch (folderError) {
          this.logger.error(`Failed to sync folder ${folder.name}`, folderError);
          errors++;
        }
      }

      // 更新同步状态
      await this.updateSyncState(channelId, {
        lastSyncAt: new Date(),
        totalSynced: synced,
      } as SyncState);

    } catch (error) {
      this.logger.error('Mailbox sync failed', error);
      throw error;
    }

    return { synced, errors };
  }

  async syncFolder(
    config: ImapConfig,
    channelId: string,
    folder: { path: string; name: string },
    options: SyncOptions & { batchSize: number },
  ): Promise<{ synced: number; errors: number }> {
    let synced = 0;
    let errors = 0;

    try {
      // 检查UIDVALIDITY
      const uidValidity = await this.imapClient.getUidValidity(config, folder.path);
      const syncState = await this.getSyncState(channelId, folder.path);

      // 如果UIDVALIDITY变化，需要全量同步
      const fullSync = options.fullSync || !syncState || syncState.uidValidity !== uidValidity;

      if (fullSync) {
        this.logger.log(`Performing full sync for folder ${folder.name}`);
        
        // 全量同步
        const messages = await this.imapClient.fetchMessages(config, folder.path, {
          limit: options.batchSize,
        });

        for (const message of messages) {
          try {
            await this.saveMessage(message, channelId, folder.name);
            synced++;
          } catch (saveError) {
            this.logger.error(`Failed to save message ${message.messageId}`, saveError);
            errors++;
          }
        }
      } else {
        // 增量同步
        this.logger.log(`Performing incremental sync for folder ${folder.name}`);
        
        const messages = await this.imapClient.fetchMessages(config, folder.path, {
          since: syncState.lastSyncAt,
        });

        for (const message of messages) {
          if (message.uid > syncState.lastUid) {
            try {
              await this.saveMessage(message, channelId, folder.name);
              synced++;
            } catch (saveError) {
              this.logger.error(`Failed to save message ${message.messageId}`, saveError);
              errors++;
            }
          }
        }
      }

      // 更新文件夹同步状态
      await this.updateFolderSyncState(channelId, folder.path, {
        lastSyncAt: new Date(),
        lastUid: await this.getLastUid(config, folder.path),
        uidValidity,
      });

    } catch (error) {
      this.logger.error(`Folder sync failed for ${folder.name}`, error);
      throw error;
    }

    return { synced, errors };
  }

  async performIncrementalSync(
    config: ImapConfig,
    channelId: string,
  ): Promise<{ synced: number; errors: number }> {
    return this.syncMailbox(config, channelId, { fullSync: false });
  }

  private async saveMessage(
    message: ImapMessage,
    channelId: string,
    folderName: string,
  ): Promise<void> {
    const existingMessage = await this.messageRepository.findOne({
      where: { externalId: message.messageId },
    });

    if (existingMessage) {
      // 更新现有消息
      await this.messageRepository.update(existingMessage.id, {
        subject: message.subject,
        body: message.text || message.html,
        receivedAt: message.date,
        isRead: message.seen,
      });
    } else {
      // 创建新消息
      const newMessage = this.messageRepository.create({
        externalId: message.messageId,
        subject: message.subject,
        body: message.text || message.html,
        receivedAt: message.date,
        isRead: message.seen,
        messageChannelId: channelId,
        folder: folderName,
      });

      await this.messageRepository.save(newMessage);
    }
  }

  private filterMainFolders(folders: any[]): any[] {
    const mainFolderNames = ['INBOX', 'Sent', 'Drafts', 'Trash', 'Archive'];
    
    return folders.filter(folder => {
      const name = folder.name.toUpperCase();
      const specialUse = folder.specialUse?.toUpperCase() || '';
      
      return mainFolderNames.some(mainName => 
        name.includes(mainName) || specialUse.includes(mainName),
      );
    });
  }

  private async getSyncState(channelId: string, folderPath: string): Promise<SyncState | null> {
    // 从数据库或缓存获取同步状态
    // 这里简化实现，实际需要存储在数据库中
    return null;
  }

  private async updateSyncState(channelId: string, state: SyncState): Promise<void> {
    // 更新渠道同步状态
  }

  private async updateFolderSyncState(
    channelId: string,
    folderPath: string,
    state: Partial<SyncState>,
  ): Promise<void> {
    // 更新文件夹同步状态
  }

  private async getLastUid(config: ImapConfig, folderPath: string): Promise<number> {
    try {
      const messageCount = await this.imapClient.getMessageCount(config, folderPath);
      return messageCount;
    } catch {
      return 0;
    }
  }
}
