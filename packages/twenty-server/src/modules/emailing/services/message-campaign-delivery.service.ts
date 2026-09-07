import { Injectable, Logger } from '@nestjs/common';

import { In } from 'typeorm';

import { CampaignDeliveryEntity } from 'src/engine/core-modules/emailing-domain/campaign-delivery.entity';
import { SEND_CAMPAIGN_EMAIL_JOB } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { CLAIMABLE_CAMPAIGN_DELIVERY_STATES } from 'src/engine/core-modules/emailing-domain/constants/claimable-campaign-delivery-states.constant';
import { CAMPAIGN_SEND_RETRY_BACKOFF } from 'src/engine/core-modules/emailing-domain/constants/campaign-send-retry-backoff.constant';
import { CAMPAIGN_SEND_RETRY_LIMIT } from 'src/engine/core-modules/emailing-domain/constants/campaign-send-retry-limit.constant';
import { CAMPAIGN_DELIVERY_CLAIM_TTL_MS } from 'src/engine/core-modules/emailing-domain/constants/campaign-delivery-claim-ttl-ms.constant';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { UsageLimitSpeedService } from 'src/engine/core-modules/usage-limit/services/usage-limit-speed.service';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { CAMPAIGN_DELIVERY_STATE } from 'src/engine/core-modules/emailing-domain/constants/campaign-delivery-state.constant';
import { CAMPAIGN_FAILURE_REASON } from 'src/engine/core-modules/emailing-domain/constants/campaign-failure-reason.constant';
import { CAMPAIGN_SKIP_REASON } from 'src/engine/core-modules/emailing-domain/constants/campaign-skip-reason.constant';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { v4 } from 'uuid';
import { type EmailingDomainEmailContent } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-email-content.type';
import { type EmailingDomainSendEmailResult } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-result.type';
import { type SendCampaignEmailJobData } from 'src/engine/core-modules/emailing-domain/types/send-campaign-email-job-data.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { CampaignVariableService } from 'src/modules/emailing/services/campaign-variable.service';
import { EmailBillingService } from 'src/modules/emailing/services/email-billing.service';
import { type EmailCreditContext } from 'src/modules/emailing/types/email-credit-context.type';
import { EmailingDomainSenderService } from 'src/modules/emailing/services/emailing-domain-sender.service';
import { MessageCampaignLifecycleService } from 'src/modules/emailing/services/message-campaign-lifecycle.service';
import { MessageCampaignStatisticsService } from 'src/modules/emailing/services/message-campaign-statistics.service';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';
import { resolveCampaignSendFailure } from 'src/modules/emailing/utils/resolve-campaign-send-failure.util';
import { renderCampaignEmail } from 'src/modules/emailing/utils/render-campaign-email.util';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { MessageCampaignStatus } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type SendContext = {
  campaign: MessageCampaignWorkspaceEntity;
  person: PersonWorkspaceEntity | null;
  claimToken: string;
};

const SEND_SLOT_RETRY = {
  attemptLimit: 60,
  jitterRatio: 0.5,
  maxWindows: 3,
  minDelayMs: 1_000,
  maxDelayMs: 60_000,
};

type SendSlotRefusal = { retryDelayMs: number; windowMs: number };

@Injectable()
export class MessageCampaignDeliveryService {
  private readonly logger = new Logger(MessageCampaignDeliveryService.name);

  constructor(
    @InjectWorkspaceScopedRepository(CampaignDeliveryEntity)
    private readonly campaignDeliveryRepository: WorkspaceScopedRepository<CampaignDeliveryEntity>,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly emailingDomainSenderService: EmailingDomainSenderService,
    private readonly emailBillingService: EmailBillingService,
    private readonly campaignVariableService: CampaignVariableService,
    private readonly messageCampaignLifecycleService: MessageCampaignLifecycleService,
    private readonly messageCampaignStatisticsService: MessageCampaignStatisticsService,
    private readonly usageLimitSpeedService: UsageLimitSpeedService,
    @InjectMessageQueue(MessageQueue.campaignQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async processSendJob(data: SendCampaignEmailJobData): Promise<void> {
    const { workspaceId, campaignId } = data;

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const campaign = await this.findRunningCampaign(campaignId);

      if (!isDefined(campaign)) {
        return;
      }

      const isStillClaimable = await this.campaignDeliveryRepository.existsBy(
        workspaceId,
        {
          id: data.messageId,
          state: In(CLAIMABLE_CAMPAIGN_DELIVERY_STATES),
        },
      );

      if (!isStillClaimable) {
        return;
      }

      const creditContext =
        await this.emailBillingService.getEmailCreditContext(workspaceId);

      if (creditContext.hasCredits) {
        const refusal = await this.findSendSlotRefusal(workspaceId);

        if (isDefined(refusal)) {
          await this.requeueRateLimitedSendJob({ data, refusal });

          return;
        }
      }

      const messageRepository = this.workspaceOrmManager.getRepository(
        MessageWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

      const sendContext = await this.loadSendContext({ data, campaign });

      if (!isDefined(sendContext)) {
        return;
      }

      await this.deliverMessage({
        data,
        messageRepository,
        sendContext,
        creditContext,
      });

      await this.messageCampaignStatisticsService
        .scheduleRefresh({ workspaceId, campaignId })
        .catch((error) => {
          this.logger.error(
            `Campaign ${campaignId} of workspace ${workspaceId} could not schedule a statistics refresh: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        });

      await this.messageCampaignLifecycleService.finalizeCampaignIfComplete({
        workspaceId,
        campaignId,
      });
    }, buildSystemAuthContext(workspaceId));
  }

  private async findRunningCampaign(
    campaignId: string,
  ): Promise<MessageCampaignWorkspaceEntity | null> {
    const campaignRepository = this.workspaceOrmManager.getRepository(
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

    return campaign;
  }

  private async findSendSlotRefusal(
    workspaceId: string,
  ): Promise<SendSlotRefusal | null> {
    try {
      await this.usageLimitSpeedService.consumeOrThrow({
        resourceType: UsageResourceType.EMAIL,
        operationType: UsageOperationType.EMAIL_SEND,
        authContext: buildSystemAuthContext(workspaceId),
      });

      return null;
    } catch (error) {
      if (
        !(error instanceof UsageLimitException) ||
        error.code !== UsageLimitExceptionCode.RATE_LIMITED
      ) {
        throw error;
      }

      return {
        retryDelayMs: Math.max(
          error.exhaustedScope?.retryAfterMs ?? 0,
          SEND_SLOT_RETRY.minDelayMs,
        ),
        windowMs:
          error.exhaustedScope?.periodUnit === 'second'
            ? (error.exhaustedScope.periodCount ?? 0) * 1000
            : 0,
      };
    }
  }

  private async requeueRateLimitedSendJob({
    data,
    refusal: { retryDelayMs, windowMs },
  }: {
    data: SendCampaignEmailJobData;
    refusal: SendSlotRefusal;
  }): Promise<void> {
    const attemptCount = (data.rateLimitedAttemptCount ?? 0) + 1;

    if (attemptCount > SEND_SLOT_RETRY.attemptLimit) {
      await this.failRateLimitedDelivery({
        workspaceId: data.workspaceId,
        campaignId: data.campaignId,
        messageId: data.messageId,
      });

      return;
    }

    const backoffCeilingMs = Math.min(
      windowMs * SEND_SLOT_RETRY.maxWindows,
      SEND_SLOT_RETRY.maxDelayMs,
    );

    const backoffMs = Math.min(
      retryDelayMs * 2 ** (attemptCount - 1),
      Math.max(backoffCeilingMs, SEND_SLOT_RETRY.minDelayMs),
    );

    await this.messageQueueService.add<SendCampaignEmailJobData>(
      SEND_CAMPAIGN_EMAIL_JOB,
      { ...data, rateLimitedAttemptCount: attemptCount },
      {
        delay: Math.ceil(
          backoffMs * (1 + Math.random() * SEND_SLOT_RETRY.jitterRatio),
        ),
        retryLimit: CAMPAIGN_SEND_RETRY_LIMIT,
        backoff: CAMPAIGN_SEND_RETRY_BACKOFF,
      },
    );
  }

  private async failRateLimitedDelivery({
    workspaceId,
    campaignId,
    messageId,
  }: {
    workspaceId: string;
    campaignId: string;
    messageId: string;
  }): Promise<void> {
    const { affected } = await this.campaignDeliveryRepository.update(
      workspaceId,
      {
        id: messageId,
        state: In(CLAIMABLE_CAMPAIGN_DELIVERY_STATES),
      },
      {
        state: CAMPAIGN_DELIVERY_STATE.FAILED,
        failureReason: CAMPAIGN_FAILURE_REASON.RATE_LIMITED,
      },
    );

    if (affected === 1) {
      this.logger.warn(
        `Campaign ${campaignId} of workspace ${workspaceId} gave up on message ${messageId} after ${SEND_SLOT_RETRY.attemptLimit} refused send slots`,
      );
    }

    await this.messageCampaignLifecycleService.finalizeCampaignIfComplete({
      workspaceId,
      campaignId,
    });
  }

  private async loadSendContext({
    data,
    campaign,
  }: {
    data: SendCampaignEmailJobData;
    campaign: MessageCampaignWorkspaceEntity;
  }): Promise<SendContext | null> {
    const { workspaceId, campaignId, messageId, personId } = data;

    const campaignRepository = this.workspaceOrmManager.getRepository(
      MessageCampaignWorkspaceEntity,
      { shouldBypassPermissionChecks: true },
    );

    const claimToken = await this.claimDeliveryForSending({
      workspaceId,
      messageId,
    });

    if (!isDefined(claimToken)) {
      return null;
    }

    const campaignAfterClaim = await campaignRepository.findOne({
      where: { id: campaignId },
      select: { id: true, status: true },
    });

    if (campaignAfterClaim?.status === MessageCampaignStatus.CANCELED) {
      await this.settleClaimedDelivery({
        workspaceId,
        messageId,
        claimToken,
        update: {
          state: CAMPAIGN_DELIVERY_STATE.SKIPPED,
          skipReason: CAMPAIGN_SKIP_REASON.CAMPAIGN_CANCELED,
        },
      });

      return null;
    }

    const personRepository = this.workspaceOrmManager.getRepository(
      PersonWorkspaceEntity,
      { shouldBypassPermissionChecks: true },
    );

    return {
      campaign,
      claimToken,
      person: await personRepository.findOne({ where: { id: personId } }),
    };
  }

  private async deliverMessage({
    data,
    messageRepository,
    sendContext: { campaign, person, claimToken },
    creditContext: { hasCredits },
  }: {
    data: SendCampaignEmailJobData;
    messageRepository: WorkspaceRepository<MessageWorkspaceEntity>;
    sendContext: SendContext;
    creditContext: EmailCreditContext;
  }): Promise<void> {
    const {
      workspaceId,
      campaignId,
      messageId,
      recipientEmail,
      emailingDomainId,
      userWorkspaceId,
    } = data;

    if (!hasCredits) {
      await this.settleClaimedDelivery({
        workspaceId,
        messageId,
        claimToken,
        update: {
          state: CAMPAIGN_DELIVERY_STATE.SKIPPED,
          skipReason: CAMPAIGN_SKIP_REASON.OUT_OF_CREDITS,
        },
      });

      return;
    }

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

    const result = await this.sendOrRecordFailure({
      messageId,
      claimToken,
      campaignId,
      workspaceId,
      emailingDomainId,
      email: {
        from: campaign.fromAddress?.primaryEmail ?? '',
        to: [recipientEmail],
        subject,
        text: plainText,
        html,
        sendKind: 'MARKETING',
        unsubscribeTopicId: campaign.unsubscribeTopicId ?? undefined,
      },
    });

    if (!isDefined(result)) {
      return;
    }

    const affected = await this.settleClaimedDelivery({
      workspaceId,
      messageId,
      claimToken,
      update: {
        state: CAMPAIGN_DELIVERY_STATE.SENT,
        providerMessageId: result.messageId,
        sentAt: new Date(),
        failureReason: null,
        skipReason: null,
      },
    });

    if (affected !== 1) {
      this.logger.warn(
        `Campaign ${campaignId} delivered message ${messageId} but another worker owns the claim, so this send is recorded by neither and is not billed`,
      );

      return;
    }

    await messageRepository.update(messageId, {
      headerMessageId: result.messageId,
      subject,
      text: plainText,
    });

    await this.emailBillingService
      .billSentEmails({
        workspaceId,
        sentEmailCount: 1,
        userWorkspaceId,
      })
      .catch((error) => {
        this.logger.error(
          `Campaign ${campaignId} delivered message ${messageId} but failed to bill it, so this send is unbilled: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      });

    await this.linkMessageToProviderThread({
      messageId,
      providerMessageId: result.messageId,
    });
  }

  private async linkMessageToProviderThread({
    messageId,
    providerMessageId,
  }: {
    messageId: string;
    providerMessageId: string;
  }): Promise<void> {
    const associationRepository = this.workspaceOrmManager.getRepository(
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
    messageId,
    claimToken,
    campaignId,
    workspaceId,
    emailingDomainId,
    email,
  }: {
    messageId: string;
    claimToken: string;
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
        workspaceId,
        messageId,
        claimToken,
        campaignId,
        error,
      });

      return null;
    }
  }

  private async recordSendFailure({
    workspaceId,
    messageId,
    claimToken,
    campaignId,
    error,
  }: {
    workspaceId: string;
    messageId: string;
    claimToken: string;
    campaignId: string;
    error: unknown;
  }): Promise<void> {
    const { state, skipReason, failureReason, shouldRetry } =
      resolveCampaignSendFailure(error);

    await this.settleClaimedDelivery({
      workspaceId,
      messageId,
      claimToken,
      update: shouldRetry
        ? { state: CAMPAIGN_DELIVERY_STATE.QUEUED, skipReason, failureReason }
        : { state, skipReason, failureReason },
    });

    if (state === CAMPAIGN_DELIVERY_STATE.FAILED) {
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

  private async claimDeliveryForSending({
    workspaceId,
    messageId,
  }: {
    workspaceId: string;
    messageId: string;
  }): Promise<string | null> {
    const claimToken = v4();

    const { affected } = await this.campaignDeliveryRepository.update(
      workspaceId,
      {
        id: messageId,
        state: In(CLAIMABLE_CAMPAIGN_DELIVERY_STATES),
      },
      {
        state: CAMPAIGN_DELIVERY_STATE.SENDING,
        claimToken,
        claimExpiresAt: new Date(Date.now() + CAMPAIGN_DELIVERY_CLAIM_TTL_MS),
      },
    );

    return affected === 1 ? claimToken : null;
  }

  private async settleClaimedDelivery({
    workspaceId,
    messageId,
    claimToken,
    update,
  }: {
    workspaceId: string;
    messageId: string;
    claimToken: string;
    update: Partial<
      Pick<
        CampaignDeliveryEntity,
        | 'state'
        | 'skipReason'
        | 'failureReason'
        | 'providerMessageId'
        | 'sentAt'
      >
    >;
  }): Promise<number> {
    const { affected } = await this.campaignDeliveryRepository.update(
      workspaceId,
      { id: messageId, claimToken },
      { ...update, claimToken: null, claimExpiresAt: null },
    );

    return affected ?? 0;
  }
}
