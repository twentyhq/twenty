import { Injectable, Logger } from '@nestjs/common';

import { Between, In } from 'typeorm';

import { CAMPAIGN_MESSAGE_DELIVERY_STATUS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { type EmailingDomainEmailContent } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-email-content.type';
import { type EmailingDomainSendEmailResult } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-result.type';
import { type SendCampaignEmailJobData } from 'src/engine/core-modules/emailing-domain/types/send-campaign-email-job-data.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import type { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { CampaignVariableService } from 'src/modules/emailing/services/campaign-variable.service';
import { EmailBillingService } from 'src/modules/emailing/services/email-billing.service';
import { EmailingDomainSenderService } from 'src/modules/emailing/services/emailing-domain-sender.service';
import { MessageCampaignLifecycleService } from 'src/modules/emailing/services/message-campaign-lifecycle.service';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';
import { resolveCampaignSendFailure } from 'src/modules/emailing/utils/resolve-campaign-send-failure.util';
import { renderCampaignEmail } from 'src/modules/emailing/utils/render-campaign-email.util';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { MessageCampaignStatus } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type MessageRepository = WorkspaceRepository<MessageWorkspaceEntity>;

type SendContext = {
  campaign: MessageCampaignWorkspaceEntity;
  person: PersonWorkspaceEntity | null;
  claimedAt: string;
};

@Injectable()
export class MessageCampaignDeliveryService {
  private readonly logger = new Logger(MessageCampaignDeliveryService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly emailingDomainSenderService: EmailingDomainSenderService,
    private readonly emailBillingService: EmailBillingService,
    private readonly campaignVariableService: CampaignVariableService,
    private readonly messageCampaignLifecycleService: MessageCampaignLifecycleService,
  ) {}

  async processSendJob(data: SendCampaignEmailJobData): Promise<void> {
    const { workspaceId, campaignId } = data;

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          MessageWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );

      const sendContext = await this.loadSendContext({
        data,
        messageRepository,
      });

      if (!isDefined(sendContext)) {
        return;
      }

      try {
        await this.deliverMessage({ data, messageRepository, sendContext });
      } catch (error) {
        await this.releaseClaimAfterUnexpectedFailure({
          messageRepository,
          messageId: data.messageId,
          claimedAt: sendContext.claimedAt,
        });

        throw error;
      }

      await this.messageCampaignLifecycleService.finalizeCampaignIfComplete({
        workspaceId,
        campaignId,
      });
    }, buildSystemAuthContext(workspaceId));
  }

  private async loadSendContext({
    data,
    messageRepository,
  }: {
    data: SendCampaignEmailJobData;
    messageRepository: MessageRepository;
  }): Promise<SendContext | null> {
    const { workspaceId, campaignId, messageId, personId } = data;

    const campaignRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        MessageCampaignWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

    const campaign = await campaignRepository.findOne({
      where: { id: campaignId },
    });

    if (
      !isDefined(campaign) ||
      campaign.status === MessageCampaignStatus.CANCELED
    ) {
      return null;
    }

    const claimedAt = await this.claimMessageForSending({
      messageRepository,
      messageId,
    });

    if (!isDefined(claimedAt)) {
      return null;
    }

    const campaignAfterClaim = await campaignRepository.findOne({
      where: { id: campaignId },
      select: { id: true, status: true },
    });

    if (campaignAfterClaim?.status === MessageCampaignStatus.CANCELED) {
      await messageRepository.update(
        this.buildClaimedMessageCriteria({ messageId, claimedAt }),
        { deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SKIPPED },
      );

      return null;
    }

    const personRepository = await this.globalWorkspaceOrmManager.getRepository(
      workspaceId,
      PersonWorkspaceEntity,
      { shouldBypassPermissionChecks: true },
    );

    return {
      campaign,
      claimedAt,
      person: await personRepository.findOne({ where: { id: personId } }),
    };
  }

  private async deliverMessage({
    data,
    messageRepository,
    sendContext: { campaign, person, claimedAt },
  }: {
    data: SendCampaignEmailJobData;
    messageRepository: MessageRepository;
    sendContext: SendContext;
  }): Promise<void> {
    const {
      workspaceId,
      campaignId,
      messageId,
      recipientEmail,
      emailingDomainId,
    } = data;

    const variables =
      await this.campaignVariableService.buildVariablesForPerson(
        workspaceId,
        person,
      );
    const { subject, html, plainText } = await renderCampaignEmail({
      subjectTemplate: campaign.subject ?? '',
      bodyTemplate: campaign.bodyTemplate ?? '',
      variables,
    });

    const hasEmailCredits =
      await this.emailBillingService.hasEmailCredits(workspaceId);

    if (!hasEmailCredits) {
      await messageRepository.update(
        this.buildClaimedMessageCriteria({ messageId, claimedAt }),
        { deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SKIPPED },
      );

      return;
    }

    const result = await this.sendOrRecordFailure({
      messageRepository,
      messageId,
      claimedAt,
      campaignId,
      workspaceId,
      emailingDomainId,
      email: {
        from: campaign.fromAddress?.primaryEmail ?? '',
        to: [recipientEmail],
        subject,
        text: plainText,
        html,
        unsubscribeTopicId: campaign.unsubscribeTopicId ?? undefined,
      },
    });

    if (!isDefined(result)) {
      return;
    }

    const { affected } = await messageRepository.update(
      this.buildClaimedMessageCriteria({ messageId, claimedAt }),
      {
        deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENT,
        headerMessageId: result.messageId,
        subject,
        text: plainText,
      },
    );

    if (affected !== 1) {
      this.logger.warn(
        `Campaign ${campaignId} delivered message ${messageId} but another worker owns the claim, so this send is recorded by neither and is not billed`,
      );

      return;
    }

    await this.emailBillingService.billSentEmails({
      workspaceId,
      sentEmailCount: 1,
    });

    await this.linkMessageToProviderThread({
      workspaceId,
      messageId,
      providerMessageId: result.messageId,
    });
  }

  private async linkMessageToProviderThread({
    workspaceId,
    messageId,
    providerMessageId,
  }: {
    workspaceId: string;
    messageId: string;
    providerMessageId: string;
  }): Promise<void> {
    const associationRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        MessageChannelMessageAssociationWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

    await associationRepository.update(
      { messageId },
      {
        messageExternalId: providerMessageId,
        messageThreadExternalId: providerMessageId,
      },
    );
  }

  private async sendOrRecordFailure({
    messageRepository,
    messageId,
    claimedAt,
    campaignId,
    workspaceId,
    emailingDomainId,
    email,
  }: {
    messageRepository: MessageRepository;
    messageId: string;
    claimedAt: string;
    campaignId: string;
    workspaceId: string;
    emailingDomainId: string;
    email: EmailingDomainEmailContent;
  }): Promise<EmailingDomainSendEmailResult | null> {
    try {
      return await this.emailingDomainSenderService.sendEmail(
        workspaceId,
        emailingDomainId,
        email,
      );
    } catch (error) {
      await this.recordSendFailure({
        messageRepository,
        messageId,
        claimedAt,
        campaignId,
        error,
      });

      return null;
    }
  }

  private async recordSendFailure({
    messageRepository,
    messageId,
    claimedAt,
    campaignId,
    error,
  }: {
    messageRepository: MessageRepository;
    messageId: string;
    claimedAt: string;
    campaignId: string;
    error: unknown;
  }): Promise<void> {
    const { deliveryStatus, shouldRetry } = resolveCampaignSendFailure(error);

    await messageRepository.update(
      this.buildClaimedMessageCriteria({ messageId, claimedAt }),
      { deliveryStatus },
    );

    if (deliveryStatus === CAMPAIGN_MESSAGE_DELIVERY_STATUS.FAILED) {
      this.logger.warn(
        `Campaign ${campaignId} send failed for message ${messageId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    if (shouldRetry) {
      throw error;
    }
  }

  private async releaseClaimAfterUnexpectedFailure({
    messageRepository,
    messageId,
    claimedAt,
  }: {
    messageRepository: MessageRepository;
    messageId: string;
    claimedAt: string;
  }): Promise<void> {
    await messageRepository.update(
      this.buildClaimedMessageCriteria({ messageId, claimedAt }),
      { deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.FAILED },
    );
  }

  private async claimMessageForSending({
    messageRepository,
    messageId,
  }: {
    messageRepository: MessageRepository;
    messageId: string;
  }): Promise<string | null> {
    const { affected } = await messageRepository.update(
      {
        id: messageId,
        deliveryStatus: In([
          CAMPAIGN_MESSAGE_DELIVERY_STATUS.QUEUED,
          CAMPAIGN_MESSAGE_DELIVERY_STATUS.FAILED,
        ]),
      },
      { deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENDING },
    );

    if (affected !== 1) {
      return null;
    }

    const claimedMessage = await messageRepository.findOne({
      where: { id: messageId },
      select: { id: true, updatedAt: true },
    });

    return claimedMessage?.updatedAt ?? null;
  }

  private buildClaimedMessageCriteria({
    messageId,
    claimedAt,
  }: {
    messageId: string;
    claimedAt: string;
  }) {
    const claimedAtMilliseconds = new Date(claimedAt).getTime();

    return {
      id: messageId,
      deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENDING,
      updatedAt: Between(
        new Date(claimedAtMilliseconds).toISOString(),
        new Date(claimedAtMilliseconds + 1).toISOString(),
      ),
    };
  }
}
