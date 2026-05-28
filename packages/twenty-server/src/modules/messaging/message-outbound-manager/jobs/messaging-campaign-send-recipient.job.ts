import { Logger, Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { EmailingDomainService } from 'src/engine/core-modules/emailing-domain/services/emailing-domain.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type MessageCampaignWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-campaign.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

export type MessagingCampaignSendRecipientJobData = {
  workspaceId: string;
  campaignId: string;
  messageId: string;
  emailingDomainId: string;
  messageChannelId: string;
  personId: string;
  toAddress: string;
};

@Processor({
  queueName: MessageQueue.emailQueue,
  scope: Scope.REQUEST,
})
export class MessagingCampaignSendRecipientJob {
  private readonly logger = new Logger(MessagingCampaignSendRecipientJob.name);

  constructor(
    private readonly emailingDomainService: EmailingDomainService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  @Process(MessagingCampaignSendRecipientJob.name)
  async handle(data: MessagingCampaignSendRecipientJobData): Promise<void> {
    const {
      workspaceId,
      campaignId,
      messageId,
      emailingDomainId,
      toAddress,
    } = data;

    const messageRepository =
      await this.globalWorkspaceOrmManager.getRepository<MessageWorkspaceEntity>(
        workspaceId,
        'message',
        { shouldBypassPermissionChecks: true },
      );

    const campaignRepository =
      await this.globalWorkspaceOrmManager.getRepository<MessageCampaignWorkspaceEntity>(
        workspaceId,
        'messageCampaign',
        { shouldBypassPermissionChecks: true },
      );

    const message = await messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      this.logger.warn(
        `Campaign message ${messageId} not found in workspace ${workspaceId}; skipping send`,
      );
      return;
    }

    const campaign = await campaignRepository.findOne({
      where: { id: campaignId },
    });

    if (!campaign) {
      this.logger.warn(
        `Campaign ${campaignId} not found in workspace ${workspaceId}; skipping send`,
      );
      return;
    }

    const html = campaign.bodyTemplate ?? '';
    // SES requires a plain-text body alongside the HTML. The frontend's
    // BlockNote editor produces HTML; we strip tags for the text fallback.
    // Good enough for v1; a proper html-to-text pass can come later.
    const text = stripHtmlTags(html);

    try {
      const result = await this.emailingDomainService.sendEmail(
        workspaceId,
        emailingDomainId,
        {
          from: campaign.fromAddress ?? '',
          to: [toAddress],
          subject: campaign.subject ?? '',
          text,
          html,
          replyTo: campaign.replyTo ? [campaign.replyTo] : undefined,
        },
      );

      await messageRepository.update(
        { id: messageId },
        {
          deliveryStatus: 'SENT',
          providerMessageId: result.messageId,
        },
      );

      await campaignRepository.increment(
        { id: campaignId },
        'sentCount',
        1,
      );
    } catch (error) {
      this.logger.error(
        `Campaign ${campaignId} send to ${toAddress} failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      await messageRepository.update(
        { id: messageId },
        {
          deliveryStatus: 'FAILED',
        },
      );

      await campaignRepository.increment(
        { id: campaignId },
        'failedCount',
        1,
      );
    }

    await this.maybeFinalizeCampaign({
      workspaceId,
      campaignId,
    });
  }

  // Mark the campaign as SENT (or FAILED if 100% bounce/fail) once every
  // recipient message has reached a terminal status. Cheap to call on every
  // send; the query is indexed on sourceCampaignId.
  private async maybeFinalizeCampaign({
    workspaceId,
    campaignId,
  }: {
    workspaceId: string;
    campaignId: string;
  }): Promise<void> {
    const messageRepository =
      await this.globalWorkspaceOrmManager.getRepository<MessageWorkspaceEntity>(
        workspaceId,
        'message',
        { shouldBypassPermissionChecks: true },
      );

    const campaignRepository =
      await this.globalWorkspaceOrmManager.getRepository<MessageCampaignWorkspaceEntity>(
        workspaceId,
        'messageCampaign',
        { shouldBypassPermissionChecks: true },
      );

    const messages = await messageRepository.find({
      where: { sourceCampaignId: campaignId },
      select: ['id', 'deliveryStatus'],
    });

    const stillInFlight = messages.some(
      (message) =>
        message.deliveryStatus === 'QUEUED' ||
        message.deliveryStatus === null,
    );

    if (stillInFlight) {
      return;
    }

    const allFailed = messages.every(
      (message) =>
        message.deliveryStatus === 'FAILED' ||
        message.deliveryStatus === 'BOUNCED',
    );

    await campaignRepository.update(
      { id: campaignId },
      {
        status: allFailed ? 'FAILED' : 'SENT',
        sentAt: new Date(),
      },
    );
  }
}

// Minimal HTML → text fallback for SES's required text body. Replaces block
// tags with newlines, strips remaining tags, decodes common entities,
// collapses whitespace. Not a full html-to-text — good enough for v1.
const stripHtmlTags = (html: string): string => {
  return html
    .replace(/<(p|div|br|li|h[1-6])[^>]*>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};
