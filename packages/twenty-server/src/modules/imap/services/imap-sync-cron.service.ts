import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';

import { ImapSyncService } from './imap-sync.service';
import { ImapAuthService } from './imap-auth.service';
import { MessageChannelObjectMetadata } from 'src/modules/messaging/common/standard-objects/message-channel.object-metadata';

@Injectable()
export class ImapSyncCronService {
  private readonly logger = new Logger(ImapSyncCronService.name);
  private readonly SYNC_INTERVAL_MINUTES = 15;

  constructor(
    private readonly syncService: ImapSyncService,
    private readonly authService: ImapAuthService,
    @InjectRepository(MessageChannelObjectMetadata)
    private readonly messageChannelRepository: Repository<MessageChannelObjectMetadata>,
  ) {}

  @Cron(CronExpression.EVERY_15_MINUTES)
  async handleIncrementalSync(): Promise<void> {
    this.logger.log('Starting incremental IMAP sync...');

    try {
      // 获取所有启用的IMAP渠道
      const channels = await this.getActiveImapChannels();

      for (const channel of channels) {
        try {
          await this.syncChannel(channel);
        } catch (error) {
          this.logger.error(`Failed to sync channel ${channel.id}`, error);
        }
      }

      this.logger.log('Incremental IMAP sync completed');
    } catch (error) {
      this.logger.error('Incremental sync job failed', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleFullSync(): Promise<void> {
    this.logger.log('Starting full IMAP sync...');

    try {
      const channels = await this.getActiveImapChannels();

      for (const channel of channels) {
        try {
          await this.syncChannel(channel, true);
        } catch (error) {
          this.logger.error(`Failed to full sync channel ${channel.id}`, error);
        }
      }

      this.logger.log('Full IMAP sync completed');
    } catch (error) {
      this.logger.error('Full sync job failed', error);
    }
  }

  private async getActiveImapChannels(): Promise<MessageChannelObjectMetadata[]> {
    const lastSyncThreshold = new Date();
    lastSyncThreshold.setMinutes(lastSyncThreshold.getMinutes() - this.SYNC_INTERVAL_MINUTES);

    return this.messageChannelRepository.find({
      where: {
        isEnabled: true,
        provider: 'imap',
        lastSyncAt: LessThan(lastSyncThreshold),
      },
    });
  }

  private async syncChannel(
    channel: MessageChannelObjectMetadata,
    fullSync: boolean = false,
  ): Promise<void> {
    const config = await this.authService.getImapConfig(channel.connectedAccountId);

    if (!config) {
      this.logger.warn(`No IMAP config found for channel ${channel.id}`);
      return;
    }

    const result = await this.syncService.syncMailbox(config, channel.id, {
      fullSync,
    });

    this.logger.log(
      `Synced channel ${channel.id}: ${result.synced} messages, ${result.errors} errors`,
    );

    // 更新最后同步时间
    await this.messageChannelRepository.update(channel.id, {
      lastSyncAt: new Date(),
    });
  }
}
