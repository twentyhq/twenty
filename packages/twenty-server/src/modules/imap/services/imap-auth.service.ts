import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImapClientService } from './imap-client.service';
import { ImapConfig } from '../interfaces/imap-config.interface';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';

export interface ImapCredentials {
  email: string;
  password?: string;
  imapHost: string;
  imapPort: number;
  useTls: boolean;
  accessToken?: string;
}

@Injectable()
export class ImapAuthService {
  private readonly logger = new Logger(ImapAuthService.name);

  constructor(
    private readonly imapClient: ImapClientService,
    @InjectRepository(ConnectedAccountObjectMetadata)
    private readonly connectedAccountRepository: Repository<ConnectedAccountObjectMetadata>,
  ) {}

  async validateCredentials(credentials: ImapCredentials): Promise<boolean> {
    const config: ImapConfig = {
      host: credentials.imapHost,
      port: credentials.imapPort,
      secure: credentials.useTls,
      auth: {
        user: credentials.email,
        pass: credentials.password,
        accessToken: credentials.accessToken,
      },
    };

    return this.imapClient.testConnection(config);
  }

  async saveConnectedAccount(
    workspaceMemberId: string,
    credentials: ImapCredentials,
  ): Promise<string> {
    const isValid = await this.validateCredentials(credentials);
    
    if (!isValid) {
      throw new Error('Invalid IMAP credentials');
    }

    const connectedAccount = this.connectedAccountRepository.create({
      accountOwnerId: workspaceMemberId,
      provider: 'imap',
      email: credentials.email,
      authMethod: credentials.accessToken ? 'oauth' : 'password',
      // 密码应该加密存储
      accessToken: credentials.accessToken,
      imapHost: credentials.imapHost,
      imapPort: credentials.imapPort,
      imapSecure: credentials.useTls,
    });

    const saved = await this.connectedAccountRepository.save(connectedAccount);
    return saved.id;
  }

  async refreshAccessToken(accountId: string): Promise<string | null> {
    const account = await this.connectedAccountRepository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error('Connected account not found');
    }

    // 如果是OAuth认证，需要刷新token
    if (account.authMethod === 'oauth') {
      // 这里需要实现OAuth token刷新逻辑
      // 可能需要整合现有的OAuth服务
      this.logger.log(`Refreshing OAuth token for account ${accountId}`);
      return null;
    }

    return null;
  }

  async getImapConfig(accountId: string): Promise<ImapConfig | null> {
    const account = await this.connectedAccountRepository.findOne({
      where: { id: accountId },
    });

    if (!account || account.provider !== 'imap') {
      return null;
    }

    return {
      host: account.imapHost,
      port: account.imapPort,
      secure: account.imapSecure,
      auth: {
        user: account.email,
        pass: account.password, // 需要解密
        accessToken: account.accessToken,
      },
    };
  }

  async disconnectAccount(accountId: string): Promise<void> {
    await this.connectedAccountRepository.update(accountId, {
      isEnabled: false,
    });
  }
}
