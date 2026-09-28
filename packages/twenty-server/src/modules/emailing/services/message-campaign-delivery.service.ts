import { Injectable, Logger } from '@nestjs/common';

import { In } from 'typeorm';

import { CampaignDeliveryWorkspaceEntity } from 'src/modules/emailing/standard-objects/campaign-delivery.workspace-entity';
import { SEND_CAMPAIGN_EMAIL_JOB } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { CLAIMABLE_CAMPAIGN_DELIVERY_STATES } from 'src/engine/core-modules/emailing-domain/constants/claimable-campaign-delivery-states.constant';
import { CAMPAIGN_SEND_RETRY_BACKOFF } from 'src/engine/core-modules/emailing-domain/constants/campaign-send-retry-backoff.constant';
import { CAMPAIGN_SEND_RETRY_LIMIT } from 'src/engine/core-modules/emailing-domain/constants/campaign-send-retry-limit.constant';
import { SEND_SLOT_RETRY } from 'src/engine/core-modules/emailing-domain/constants/send-slot-retry.constant';
import { type SendSlotRefusal } from 'src/engine/core-modules/emailing-domain/types/send-slot-refusal.type';
import { computeSendSlotBackoffMs } from 'src/modules/emailing/utils/compute-send-slot-backoff-ms.util';
import { CAMPAIGN_DELIVERY_CLAIM_TTL_MS } from 'src/engine/core-modules/emailing-domain/constants/campaign-delivery-claim-ttl-ms.constant';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { CAMPAIGN_DELIVERY_STATE } from 'src/engine/core-modules/emailing-domain/constants/campaign-delivery-state.constant';
import { CAMPAIGN_FAILURE_REASON } from 'src/engine/core-modules/emailing-domain/constants/campaign-failure-reason.constant';
import { CAMPAIGN_SKIP_REASON } from 'src/engine/core-modules/emailing-domain/constants/campaign-skip-reason.constant';
import { v4 } from 'uuid';
import { type EmailingDomainEmailContent } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-email-content.type';
import { type EmailingDomainSendEmailResult } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-result.type';
import { type SendCampaignEmailJobData } from 'src/engine/core-modules/emailing-domain/types/send-campaign-email-job-data.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { CampaignSendSlotService } from 'src/modules/emailing/services/campaign-send-slot.service';
import { CampaignVariableService } from 'src/modules/emailing/services/campaign-variable.service';
import { EmailBillingService } from 'src/modules/emailing/services/email-billing.service';
import { type UsageRefusal } from 'src/engine/core-modules/billing/types/usage-refusal.type';
import { EmailingDomainSenderService } from 'src/modules/emailing/services/emailing-domain-sender.service';
import { MessageCampaignLifecycleService } from 'src/modules/emailing/services/message-campaign-lifecycle.service';
import { MessageCampaignStatisticsService } from 'src/modules/emailing/services/message-campaign-statistics.service';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';
import { buildCampaignThreadExternalId } from 'src/modules/emailing/utils/build-campaign-thread-external-id.util';
import { resolveCampaignSendFailure } from 'src/modules/emailing/utils/resolve-campaign-send-failure.util';
import { renderCampaignEmail } from 'src/modules/emailing/utils/render-campaign-email.util';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { buildOutboundThreadingHeaders } from 'src/modules/messaging/message-outbound-manager/utils/build-outbound-threading-headers.util';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { MessageCampaignStatus } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type SendContext = {
  campaign: MessageCampaignWorkspaceEntity;
  person: PersonWorkspaceEntity | null;
  claimToken: string;
};

@Injectable()
export class MessageCampaignDeliveryService {
  private readonly logger = new Logger(MessageCampaignDeliveryService.name);

  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly emailingDomainSenderService: EmailingDomainSenderService,
    private readonly emailBillingService: EmailBillingService,
    private readonly campaignVariableService: CampaignVariableService,
    private readonly messageCampaignLifecycleService: MessageCampaignLifecycleService,
    private readonly messageCampaignStatisticsService: MessageCampaignStatisticsService,
    private readonly campaignSendSlotService: CampaignSendSlotService,
    @InjectMessageQueue(MessageQueue.campaignQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async processSendJob(data: SendCampaignEmailJobData): Promise<void> {
    const { workspaceId, campaignId } = data;

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const isStillClaimable = await this.workspaceOrmManager
        .getRepository(
          CampaignDeliveryWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
          { shouldSkipEventEmission: true },
        )
        .existsBy({
          id: data.messageId,
          state: In(CLAIMABLE_CAMPAIGN_DELIVERY_STATES),
        });

      if (!isStillClaimable) {
        return;
      }

      const sendRefusal = await this.emailBillingService.findEmailSendRefusal({
        workspaceId,
        spenders: { userWorkspaceId: data.userWorkspaceId },
      });

      if (!isDefined(sendRefusal)) {
        const refusal = await this.campaignSendSlotService.findSendSlotRefusal({
          workspaceId,
        });

        if (isDefined(refusal)) {
          await this.requeueRateLimitedSendJob({ data, refusal });

          return;
        }
      }

      const campaign =
        await this.messageCampaignLifecycleService.findRunningCampaign(
          campaignId,
        );

      if (!isDefined(campaign)) {
        return;
      }

      const messageRepository = this.workspaceOrmManager.getRepository(
        MessageWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
        { shouldSkipEventEmission: true },
      );

      const sendContext = await this.loadSendContext({ data, campaign });

      if (!isDefined(sendContext)) {
        return;
      }

      await this.deliverMessage({
        data,
        messageRepository,
        sendContext,
        sendRefusal,
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

    await this.messageQueueService.add<SendCampaignEmailJobData>(
      SEND_CAMPAIGN_EMAIL_JOB,
      { ...data, rateLimitedAttemptCount: attemptCount },
      {
        delay: computeSendSlotBackoffMs({
          attemptCount,
          retryDelayMs,
          windowMs,
        }),
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
    const { generatedMaps: failedDeliveries } = await this.workspaceOrmManager
      .getRepository(
        CampaignDeliveryWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
        { shouldSkipEventEmission: true },
      )
      .createQueryBuilder()
      .where({
        id: messageId,
        state: In(CLAIMABLE_CAMPAIGN_DELIVERY_STATES),
      })
      .update()
      .set({
        state: CAMPAIGN_DELIVERY_STATE.FAILED,
        failureReason: CAMPAIGN_FAILURE_REASON.RATE_LIMITED,
      })
      .returning(['id'])
      .execute();

    if (failedDeliveries.length === 1) {
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
    const { campaignId, messageId, personId } = data;

    const campaignRepository = this.workspaceOrmManager.getRepository(
      MessageCampaignWorkspaceEntity,
      { shouldBypassPermissionChecks: true },
    );

    const claimToken = await this.claimDeliveryForSending({
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
    sendRefusal,
  }: {
    data: SendCampaignEmailJobData;
    messageRepository: WorkspaceRepository<MessageWorkspaceEntity>;
    sendContext: SendContext;
    sendRefusal: UsageRefusal | null;
  }): Promise<void> {
    const {
      workspaceId,
      campaignId,
      messageId,
      recipientEmail,
      emailingDomainId,
      userWorkspaceId,
    } = data;

    if (isDefined(sendRefusal)) {
      await this.settleClaimedDelivery({
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

    const fromAddress = campaign.fromAddress?.primaryEmail ?? '';
    const threadExternalId = buildCampaignThreadExternalId({
      messageId,
      fromAddress,
    });

    const result = await this.sendOrRecordFailure({
      messageId,
      claimToken,
      campaignId,
      workspaceId,
      emailingDomainId,
      email: {
        from: fromAddress,
        to: [recipientEmail],
        subject,
        text: plainText,
        html,
        sendKind: 'MARKETING',
        unsubscribeTopicId: campaign.unsubscribeTopicId ?? undefined,
        headers: buildOutboundThreadingHeaders({ threadExternalId }),
      },
    });

    if (!isDefined(result)) {
      return;
    }

    const affected = await this.settleClaimedDelivery({
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
      headerMessageId: result.headerMessageId ?? result.messageId,
      subject,
      text: plainText,
    });

    await this.emailBillingService
      .billSentEmails({
        workspaceId,
        sentEmailCount: 1,
        spenders: { userWorkspaceId },
      })
      .catch((error) => {
        this.logger.error(
          `Campaign ${campaignId} delivered message ${messageId} but failed to bill it, so this send is unbilled: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      });

    await this.linkMessageToProviderMessage({
      messageId,
      providerMessageId: result.messageId,
    });
  }

  private async linkMessageToProviderMessage({
    messageId,
    providerMessageId,
  }: {
    messageId: string;
    providerMessageId: string;
  }): Promise<void> {
    const associationRepository = this.workspaceOrmManager.getRepository(
      MessageChannelMessageAssociationWorkspaceEntity,
      { shouldBypassPermissionChecks: true },
      { shouldSkipEventEmission: true },
    );

    await associationRepository.update(
      { messageId },
      { messageExternalId: providerMessageId },
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
        messageId,
        claimToken,
        campaignId,
        error,
      });

      return null;
    }
  }

  private async recordSendFailure({
    messageId,
    claimToken,
    campaignId,
    error,
  }: {
    messageId: string;
    claimToken: string;
    campaignId: string;
    error: unknown;
  }): Promise<void> {
    const { state, skipReason, failureReason, shouldRetry } =
      resolveCampaignSendFailure(error);

    await this.settleClaimedDelivery({
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
    messageId,
  }: {
    messageId: string;
  }): Promise<string | null> {
    const claimToken = v4();

    const { generatedMaps: claimedDeliveries } = await this.workspaceOrmManager
      .getRepository(
        CampaignDeliveryWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
        { shouldSkipEventEmission: true },
      )
      .createQueryBuilder()
      .where({
        id: messageId,
        state: In(CLAIMABLE_CAMPAIGN_DELIVERY_STATES),
      })
      .update()
      .set({
        state: CAMPAIGN_DELIVERY_STATE.SENDING,
        claimToken,
        claimExpiresAt: new Date(Date.now() + CAMPAIGN_DELIVERY_CLAIM_TTL_MS),
      })
      .returning(['id'])
      .execute();

    return claimedDeliveries.length === 1 ? claimToken : null;
  }

  private async settleClaimedDelivery({
    messageId,
    claimToken,
    update,
  }: {
    messageId: string;
    claimToken: string;
    update: Partial<
      Pick<
        CampaignDeliveryWorkspaceEntity,
        | 'state'
        | 'skipReason'
        | 'failureReason'
        | 'providerMessageId'
        | 'sentAt'
      >
    >;
  }): Promise<number> {
    const { generatedMaps: settledDeliveries } = await this.workspaceOrmManager
      .getRepository(
        CampaignDeliveryWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
        { shouldSkipEventEmission: true },
      )
      .createQueryBuilder()
      .where({ id: messageId, claimToken })
      .update()
      .set({ ...update, claimToken: null, claimExpiresAt: null })
      .returning(['id'])
      .execute();

    return settledDeliveries.length;
  }
}
