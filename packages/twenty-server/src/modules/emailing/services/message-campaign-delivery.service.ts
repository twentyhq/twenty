import { Injectable, Logger } from '@nestjs/common';

import { In } from 'typeorm';

import {
  CAMPAIGN_MESSAGE_DELIVERY_STATUS,
  type CampaignMessageDeliveryStatus,
} from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
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
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { MessageCampaignStatus } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

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

    const hasClaimedMessage = await this.claimMessageForSending({
      messageRepository,
      messageId,
    });

    if (!hasClaimedMessage) {
      return null;
    }

    const personRepository = await this.globalWorkspaceOrmManager.getRepository(
      workspaceId,
      PersonWorkspaceEntity,
      { shouldBypassPermissionChecks: true },
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
      await messageRepository.update(
        {
          id: messageId,
          deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENDING,
        },
        { deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SKIPPED },
      );

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
      const { deliveryStatus, shouldRetry } = this.resolveSendFailure(error);

      await messageRepository.update(
        {
          id: messageId,
          deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENDING,
        },
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

      return;
    }

    const { affected } = await messageRepository.update(
      {
        id: messageId,
        deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENDING,
      },
      {
        deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENT,
        headerMessageId: result.messageId,
        subject,
        text: plainText,
      },
    );

    if (affected !== 1) {
      this.logger.warn(
        `Campaign ${campaignId} delivered message ${messageId} after the recovery job reclaimed it, so it is not recorded or billed against the finalized campaign`,
      );

      return;
    }

    await this.emailBillingService.billSentEmails({
      workspaceId,
      sentEmailCount: 1,
    });

    const associationRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        MessageChannelMessageAssociationWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

    await associationRepository.update(
      { messageId },
      {
        messageExternalId: result.messageId,
        messageThreadExternalId: result.messageId,
      },
    );
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

  private resolveSendFailure(error: unknown): {
    deliveryStatus: CampaignMessageDeliveryStatus;
    shouldRetry: boolean;
  } {
    if (!(error instanceof EmailingDomainDriverException)) {
      return {
        deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.FAILED,
        shouldRetry: true,
      };
    }

    switch (error.code) {
      case EmailingDomainDriverExceptionCode.ALL_RECIPIENTS_SUPPRESSED:
        return {
          deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SKIPPED,
          shouldRetry: false,
        };
      case EmailingDomainDriverExceptionCode.TEMPORARY_ERROR:
      case EmailingDomainDriverExceptionCode.UNKNOWN:
        return {
          deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.FAILED,
          shouldRetry: true,
        };
      case EmailingDomainDriverExceptionCode.NOT_FOUND:
      case EmailingDomainDriverExceptionCode.INSUFFICIENT_PERMISSIONS:
      case EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR:
      case EmailingDomainDriverExceptionCode.SENDING_SUSPENDED:
      case EmailingDomainDriverExceptionCode.UNSUBSCRIBE_NOT_READY:
        return {
          deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.FAILED,
          shouldRetry: false,
        };
      default:
        return assertUnreachable(error.code);
    }
  }
}
