import { Injectable, Logger, type Type } from '@nestjs/common';

import { In, type ObjectLiteral } from 'typeorm';

import { CAMPAIGN_MESSAGE_DELIVERY_STATUS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
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
import { renderCampaignEmail } from 'src/modules/emailing/utils/render-campaign-email.util';
import { resolveCampaignSendFailure } from 'src/modules/emailing/utils/resolve-campaign-send-failure.util';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { MessageCampaignStatus } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type MessageRepository = WorkspaceRepository<MessageWorkspaceEntity>;

type SendContext = {
  campaign: MessageCampaignWorkspaceEntity;
  person: PersonWorkspaceEntity | null;
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

  private getSystemRepository<T extends ObjectLiteral>(
    workspaceId: string,
    entity: Type<T>,
  ) {
    return this.globalWorkspaceOrmManager.getRepository(workspaceId, entity, {
      shouldBypassPermissionChecks: true,
    });
  }

  async processSendJob(data: SendCampaignEmailJobData): Promise<void> {
    const { workspaceId, campaignId } = data;

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageRepository = await this.getSystemRepository(
        workspaceId,
        MessageWorkspaceEntity,
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
      } finally {
        await this.messageCampaignLifecycleService.finalizeCampaignIfComplete({
          workspaceId,
          campaignId,
        });
      }
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

    const campaignRepository = await this.getSystemRepository(
      workspaceId,
      MessageCampaignWorkspaceEntity,
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

    const hasClaimedMessage = await this.claimMessageForSending({
      messageRepository,
      messageId,
    });

    if (!hasClaimedMessage) {
      return null;
    }

    const personRepository = await this.getSystemRepository(
      workspaceId,
      PersonWorkspaceEntity,
    );

    return {
      campaign,
      person: await personRepository.findOne({ where: { id: personId } }),
    };
  }

  private async deliverMessage({
    data,
    messageRepository,
    sendContext: { campaign, person },
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
      await messageRepository.update(messageId, {
        deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SKIPPED,
      });

      return;
    }

    let result: EmailingDomainSendEmailResult;

    try {
      result = await this.emailingDomainSenderService.sendEmail(
        workspaceId,
        emailingDomainId,
        {
          from: campaign.fromAddress?.primaryEmail ?? '',
          to: [recipientEmail],
          subject,
          text: plainText,
          html,
          unsubscribeTopicId: campaign.unsubscribeTopicId ?? undefined,
        },
      );
    } catch (error) {
      const { deliveryStatus, shouldRetry } = resolveCampaignSendFailure(error);

      await messageRepository.update(messageId, { deliveryStatus });

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

      return;
    }

    await messageRepository.update(messageId, {
      deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENT,
      headerMessageId: result.messageId,
      subject,
      text: plainText,
    });

    await this.emailBillingService.billSentEmails({
      workspaceId,
      sentEmailCount: 1,
    });

    const associationRepository = await this.getSystemRepository(
      workspaceId,
      MessageChannelMessageAssociationWorkspaceEntity,
    );

    await associationRepository.update(
      { messageId },
      {
        messageExternalId: result.messageId,
        messageThreadExternalId: result.messageId,
      },
    );
  }

  async recordDeliveryFailureByProviderMessageId({
    workspaceId,
    providerMessageId,
    deliveryStatus,
  }: {
    workspaceId: string;
    providerMessageId: string;
    deliveryStatus: string;
  }): Promise<void> {
    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageRepository = await this.getSystemRepository(
        workspaceId,
        MessageWorkspaceEntity,
      );

      const message = await messageRepository.findOne({
        where: { headerMessageId: providerMessageId },
      });

      if (!isDefined(message) || !isDefined(message.messageCampaignId)) {
        return;
      }

      const isAlreadyTerminal =
        message.deliveryStatus === CAMPAIGN_MESSAGE_DELIVERY_STATUS.BOUNCED ||
        message.deliveryStatus === CAMPAIGN_MESSAGE_DELIVERY_STATUS.COMPLAINED;

      if (isAlreadyTerminal) {
        return;
      }

      await messageRepository.update(message.id, { deliveryStatus });

      await this.messageCampaignLifecycleService.scheduleStatsRefresh({
        workspaceId,
        campaignId: message.messageCampaignId,
      });
    }, buildSystemAuthContext(workspaceId));
  }

  private async claimMessageForSending({
    messageRepository,
    messageId,
  }: {
    messageRepository: MessageRepository;
    messageId: string;
  }): Promise<boolean> {
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

    return affected === 1;
  }
}
