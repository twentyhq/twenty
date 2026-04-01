import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OmnichannelMessageWorkspaceEntity } from 'src/modules/omnichannel/standard-objects/omnichannel-message.workspace-entity';
import { ChannelType } from 'src/modules/omnichannel/enums/channel-type.enum';

export interface OmnichannelMessage {
  channel: ChannelType;
  content: string;
  recipient: string;
  sender?: string;
  mediaUrl?: string;
  mediaType?: string;
}

export interface ConversationStats {
  channel: string;
  messagesCount: number;
  avgResponseTime: number;
  openConversations: number;
}

@Injectable()
export class OmnichannelService {
  private readonly logger = new Logger(OmnichannelService.name);

  constructor(
    @InjectRepository(OmnichannelMessageWorkspaceEntity, 'core')
    private readonly messageRepository: Repository<OmnichannelMessageWorkspaceEntity>,
  ) {}

  async sendMessage(message: OmnichannelMessage): Promise<string> {
    let providerResponse: string;

    switch (message.channel) {
      case ChannelType.WHATSAPP:
        providerResponse = await this.sendWhatsApp(message);
        break;
      case ChannelType.SMS:
        providerResponse = await this.sendSMS(message);
        break;
      case ChannelType.INSTAGRAM:
      case ChannelType.FACEBOOK:
        providerResponse = await this.sendSocialMedia(message);
        break;
      case ChannelType.TELEGRAM:
        providerResponse = await this.sendTelegram(message);
        break;
      case ChannelType.EMAIL:
        providerResponse = await this.sendEmail(message);
        break;
      default:
        throw new Error(`Unsupported channel: ${message.channel}`);
    }

    const savedMessage = await this.messageRepository.save({
      name: `Message to ${message.recipient}`,
      channel: message.channel,
      direction: 'OUTBOUND',
      content: message.content,
      mediaUrl: message.mediaUrl,
      status: 'SENT',
      messageId: providerResponse,
      recipientPhone: message.recipient,
    });

    return savedMessage.id;
  }

  async receiveMessage(
    channel: ChannelType,
    messageData: {
      messageId: string;
      content: string;
      sender: string;
      senderName?: string;
      mediaUrl?: string;
    },
    contactId?: string,
  ): Promise<OmnichannelMessageWorkspaceEntity> {
    return this.messageRepository.save({
      name: `Message from ${messageData.sender}`,
      channel,
      direction: 'INBOUND',
      content: messageData.content,
      mediaUrl: messageData.mediaUrl,
      status: 'RECEIVED',
      messageId: messageData.messageId,
      senderPhone: messageData.sender,
      senderName: messageData.senderName,
      receivedAt: new Date(),
      contactId,
    });
  }

  async getConversation(
    contactId: string,
    options?: { channel?: ChannelType; limit?: number },
  ): Promise<OmnichannelMessageWorkspaceEntity[]> {
    const query = this.messageRepository
      .createQueryBuilder('message')
      .where('message.contactId = :contactId', { contactId })
      .orderBy('message.createdAt', 'ASC');

    if (options?.channel) {
      query.andWhere('message.channel = :channel', { channel: options.channel });
    }

    if (options?.limit) {
      query.take(options.limit);
    }

    return query.getMany();
  }

  async getInbox(
    filters?: { channel?: ChannelType; status?: string; assigneeId?: string },
    limit = 50,
  ): Promise<OmnichannelMessageWorkspaceEntity[]> {
    const query = this.messageRepository
      .createQueryBuilder('message')
      .where('message.direction = :direction', { direction: 'INBOUND' })
      .orderBy('message.createdAt', 'DESC')
      .take(limit);

    if (filters?.channel) {
      query.andWhere('message.channel = :channel', { channel: filters.channel });
    }

    if (filters?.status) {
      query.andWhere('message.status = :status', { status: filters.status });
    }

    if (filters?.assigneeId) {
      query.andWhere('message.assigneeId = :assigneeId', { assigneeId: filters.assigneeId });
    }

    return query.getMany();
  }

  async assignToAgent(messageId: string, agentId: string): Promise<void> {
    await this.messageRepository.update(messageId, {
      assigneeId: agentId,
      status: 'ASSIGNED',
    });
  }

  async markAsRead(messageId: string): Promise<void> {
    await this.messageRepository.update(messageId, {
      status: 'READ',
      readAt: new Date(),
    });
  }

  async getChannelStats(): Promise<ConversationStats[]> {
    const channels = Object.values(ChannelType);
    const stats: ConversationStats[] = [];

    for (const channel of channels) {
      const messages = await this.messageRepository.find({
        where: { channel },
      });

      const inboundMessages = messages.filter(m => m.direction === 'INBOUND');
      const avgResponseTime = this.calculateAvgResponseTime(inboundMessages);

      stats.push({
        channel,
        messagesCount: messages.length,
        avgResponseTime,
        openConversations: inboundMessages.filter(m => m.status !== 'CLOSED').length,
      });
    }

    return stats;
  }

  private calculateAvgResponseTime(messages: OmnichannelMessageWorkspaceEntity[]): number {
    const withResponse = messages.filter(m => m.receivedAt && m.readAt);
    if (withResponse.length === 0) return 0;

    const totalTime = withResponse.reduce((sum, m) => {
      const responseTime = new Date(m.readAt!).getTime() - new Date(m.receivedAt!).getTime();
      return sum + responseTime;
    }, 0);

    return Math.round(totalTime / withResponse.length / 1000 / 60);
  }

  private async sendWhatsApp(message: OmnichannelMessage): Promise<string> {
    this.logger.log(`Sending WhatsApp to ${message.recipient}`);
    return `wa_${Date.now()}`;
  }

  private async sendSMS(message: OmnichannelMessage): Promise<string> {
    this.logger.log(`Sending SMS to ${message.recipient}`);
    return `sms_${Date.now()}`;
  }

  private async sendSocialMedia(message: OmnichannelMessage): Promise<string> {
    this.logger.log(`Sending social media message to ${message.recipient}`);
    return `social_${Date.now()}`;
  }

  private async sendTelegram(message: OmnichannelMessage): Promise<string> {
    this.logger.log(`Sending Telegram to ${message.recipient}`);
    return `tg_${Date.now()}`;
  }

  private async sendEmail(message: OmnichannelMessage): Promise<string> {
    this.logger.log(`Sending email to ${message.recipient}`);
    return `email_${Date.now()}`;
  }
}
