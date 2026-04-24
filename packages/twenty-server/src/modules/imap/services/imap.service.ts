import { Injectable, Logger } from '@nestjs/common';
import { ImapSyncService } from './imap-sync.service';
import { ImapAuthService, ImapCredentials } from './imap-auth.service';
import { ImapClientService } from './imap-client.service';
import { ImapConfig, ImapFolder, ImapMessage } from '../interfaces/imap-config.interface';

@Injectable()
export class ImapService {
  private readonly logger = new Logger(ImapService.name);

  constructor(
    private readonly syncService: ImapSyncService,
    private readonly authService: ImapAuthService,
    private readonly clientService: ImapClientService,
  ) {}

  /**
   * 测试IMAP连接
   */
  async testConnection(config: ImapConfig): Promise<boolean> {
    return this.clientService.testConnection(config);
  }

  /**
   * 认证并保存IMAP账户
   */
  async authenticateAndSave(
    workspaceMemberId: string,
    credentials: ImapCredentials,
  ): Promise<string> {
    return this.authService.saveConnectedAccount(workspaceMemberId, credentials);
  }

  /**
   * 执行邮箱全量同步
   */
  async syncMailbox(
    accountId: string,
    channelId: string,
    options: { fullSync?: boolean; batchSize?: number } = {},
  ): Promise<{ synced: number; errors: number }> {
    const config = await this.authService.getImapConfig(accountId);
    
    if (!config) {
      throw new Error('IMAP configuration not found');
    }

    return this.syncService.syncMailbox(config, channelId, options);
  }

  /**
   * 执行增量同步
   */
  async syncIncremental(accountId: string, channelId: string): Promise<{ synced: number; errors: number }> {
    const config = await this.authService.getImapConfig(accountId);
    
    if (!config) {
      throw new Error('IMAP configuration not found');
    }

    return this.syncService.performIncrementalSync(config, channelId);
  }

  /**
   * 获取邮箱文件夹列表
   */
  async getFolders(accountId: string): Promise<ImapFolder[]> {
    const config = await this.authService.getImapConfig(accountId);
    
    if (!config) {
      throw new Error('IMAP configuration not found');
    }

    return this.clientService.getFolders(config);
  }

  /**
   * 获取邮件列表
   */
  async getMessages(
    accountId: string,
    folder: string,
    options: { limit?: number; since?: Date } = {},
  ): Promise<ImapMessage[]> {
    const config = await this.authService.getImapConfig(accountId);
    
    if (!config) {
      throw new Error('IMAP configuration not found');
    }

    return this.clientService.fetchMessages(config, folder, options);
  }

  /**
   * 断开IMAP连接
   */
  async disconnect(accountId: string): Promise<void> {
    await this.authService.disconnectAccount(accountId);
  }
}
