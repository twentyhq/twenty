import { Injectable, Logger } from '@nestjs/common';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';

import { ImapConfig, ImapMessage, ImapFolder } from '../interfaces/imap-config.interface';

@Injectable()
export class ImapClientService {
  private readonly logger = new Logger(ImapClientService.name);

  async testConnection(config: ImapConfig): Promise<boolean> {
    const client = new ImapFlow({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass,
        accessToken: config.auth.accessToken,
      },
      logger: false,
    });

    try {
      await client.connect();
      return true;
    } catch (error) {
      this.logger.error('IMAP connection test failed', error);
      return false;
    } finally {
      await client.logout();
    }
  }

  async getFolders(config: ImapConfig): Promise<ImapFolder[]> {
    const client = await this.createClient(config);
    
    try {
      const tree = await client.list();
      return tree.map((mailbox: any) => ({
        path: mailbox.path,
        name: mailbox.name,
        delimiter: mailbox.delimiter,
        flags: mailbox.flags,
        specialUse: mailbox.specialUse,
      }));
    } finally {
      await client.logout();
    }
  }

  async fetchMessages(
    config: ImapConfig,
    folder: string,
    options: {
      since?: Date;
      limit?: number;
      uids?: number[];
    } = {},
  ): Promise<ImapMessage[]> {
    const client = await this.createClient(config);
    const messages: ImapMessage[] = [];

    try {
      const lock = await client.getMailboxLock(folder);
      
      try {
        let query: any = {};
        
        if (options.uids && options.uids.length > 0) {
          query = { uid: options.uids };
        } else if (options.since) {
          query = { since: options.since };
        }

        const fetchOptions: any = {
          source: true,
          flags: true,
        };

        for await (const message of client.fetch(query, fetchOptions)) {
          try {
            const parsed = await simpleParser(message.source);
            
            messages.push({
              uid: message.uid,
              messageId: parsed.messageId || `imap-${message.uid}`,
              subject: parsed.subject || '',
              from: this.parseAddresses(parsed.from),
              to: this.parseAddresses(parsed.to),
              cc: this.parseAddresses(parsed.cc),
              bcc: this.parseAddresses(parsed.bcc),
              date: parsed.date || new Date(),
              text: parsed.text,
              html: parsed.html as string,
              attachments: this.parseAttachments(parsed.attachments),
              flags: message.flags || [],
              seen: message.flags?.includes('\\Seen') || false,
            });

            if (options.limit && messages.length >= options.limit) {
              break;
            }
          } catch (parseError) {
            this.logger.error(`Failed to parse message ${message.uid}`, parseError);
          }
        }
      } finally {
        lock.release();
      }
    } finally {
      await client.logout();
    }

    return messages;
  }

  async getUidValidity(config: ImapConfig, folder: string): Promise<number> {
    const client = await this.createClient(config);
    
    try {
      const lock = await client.getMailboxLock(folder);
      try {
        return client.mailbox?.uidValidity || 0;
      } finally {
        lock.release();
      }
    } finally {
      await client.logout();
    }
  }

  async getMessageCount(config: ImapConfig, folder: string): Promise<number> {
    const client = await this.createClient(config);
    
    try {
      const lock = await client.getMailboxLock(folder);
      try {
        return client.mailbox?.exists || 0;
      } finally {
        lock.release();
      }
    } finally {
      await client.logout();
    }
  }

  private async createClient(config: ImapConfig): Promise<ImapFlow> {
    const client = new ImapFlow({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass,
        accessToken: config.auth.accessToken,
      },
      logger: false,
    });

    await client.connect();
    return client;
  }

  private parseAddresses(addresses: any): { name?: string; address: string }[] {
    if (!addresses) return [];
    
    const addrArray = Array.isArray(addresses) ? addresses : [addresses];
    
    return addrArray.flatMap((addr: any) => {
      if (addr.value) {
        return addr.value.map((v: any) => ({
          name: v.name,
          address: v.address,
        }));
      }
      return [];
    });
  }

  private parseAttachments(attachments: any[]): any[] {
    if (!attachments) return [];
    
    return attachments.map((att: any) => ({
      filename: att.filename,
      contentType: att.contentType,
      size: att.size,
      content: att.content,
    }));
  }
}
