import { Logger, Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { EmailingDomainService } from 'src/engine/core-modules/emailing-domain/services/emailing-domain.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type MessageCampaignWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-campaign.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { createHtmlToTextConverter } from 'src/modules/messaging/message-import-manager/utils/create-html-to-text-converter.util';

export type MessagingCampaignSendRecipientJobData = {
  workspaceId: string;
  campaignId: string;
  messageId: string;
  emailingDomainId: string;
  messageChannelId: string;
  personId: string;
  toAddress: string;
};

// Reuse the existing inbound-converter — handles <script>/<style>/comments
// correctly (the naive regex strip we used to have did not).
const htmlToText = createHtmlToTextConverter();

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
    const { workspaceId, campaignId } = data;

    // Wrap the entire handler so even error/early-return paths still try to
    // finalize the campaign — otherwise a deleted message or campaign could
    // leave the campaign stuck in SENDING.
    try {
      await this.processOneRecipient(data);
    } finally {
      try {
        await this.maybeFinalizeCampaign({ workspaceId, campaignId });
      } catch (error) {
        this.logger.error(
          `Failed to finalize campaign ${campaignId} after job: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }
  }

  private async processOneRecipient(
    data: MessagingCampaignSendRecipientJobData,
  ): Promise<void> {
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

    // Duplicate-send guard. BullMQ may re-run a job if the worker dies between
    // the SES call and the DB write — without this check the recipient would
    // get the email twice. Once a message is in any non-QUEUED state we leave
    // it alone.
    if (message.deliveryStatus !== 'QUEUED') {
      this.logger.warn(
        `Campaign message ${messageId} already in ${message.deliveryStatus}; skipping resend`,
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

    if (!campaign.fromAddress || !campaign.subject) {
      this.logger.error(
        `Campaign ${campaignId} missing fromAddress or subject; marking message FAILED`,
      );

      await messageRepository.update(
        { id: messageId },
        { deliveryStatus: 'FAILED' },
      );

      await campaignRepository.increment(
        { id: campaignId },
        'failedCount',
        1,
      );

      return;
    }

    const html = campaign.bodyTemplate ?? '';
    const text = htmlToText(html);

    try {
      const result = await this.emailingDomainService.sendEmail(
        workspaceId,
        emailingDomainId,
        {
          from: campaign.fromAddress,
          to: [toAddress],
          subject: campaign.subject,
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
  }

  // Finalize the campaign when every recipient message has reached a terminal
  // status. Guarded by `status = 'SENDING'` so concurrent finalizers can't
  // overwrite each other (TypeORM's update accepts a where-criteria as the
  // first arg, which translates to a compare-and-swap).
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

    // Guard against vacuous truth: every() returns true on an empty array,
    // which would otherwise mark a zero-recipient campaign FAILED.
    if (messages.length === 0) {
      return;
    }

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

    // status='SENDING' guard ensures at most one finalizer wins — subsequent
    // writers' updates match zero rows.
    await campaignRepository.update(
      { id: campaignId, status: 'SENDING' },
      {
        status: allFailed ? 'FAILED' : 'SENT',
        sentAt: new Date(),
      },
    );
  }
}
