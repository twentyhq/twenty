import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource, In } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { CampaignDeliveryEntity } from 'src/engine/core-modules/emailing-domain/campaign-delivery.entity';
import { SEND_CAMPAIGN_EMAIL_BATCH_JOB } from 'src/engine/core-modules/emailing-domain/constants/send-campaign-email-batch-job.constant';
import { CAMPAIGN_DELIVERY_CLAIM_TTL_MS } from 'src/engine/core-modules/emailing-domain/constants/campaign-delivery-claim-ttl-ms.constant';
import { CAMPAIGN_DELIVERY_STATE } from 'src/engine/core-modules/emailing-domain/constants/campaign-delivery-state.constant';
import { CAMPAIGN_FAILURE_REASON } from 'src/engine/core-modules/emailing-domain/constants/campaign-failure-reason.constant';
import { CAMPAIGN_SEND_RETRY_BACKOFF } from 'src/engine/core-modules/emailing-domain/constants/campaign-send-retry-backoff.constant';
import { CAMPAIGN_SEND_RETRY_LIMIT } from 'src/engine/core-modules/emailing-domain/constants/campaign-send-retry-limit.constant';
import { CAMPAIGN_SKIP_REASON } from 'src/engine/core-modules/emailing-domain/constants/campaign-skip-reason.constant';
import { CLAIMABLE_CAMPAIGN_DELIVERY_STATES } from 'src/engine/core-modules/emailing-domain/constants/claimable-campaign-delivery-states.constant';
import { SEND_SLOT_RETRY } from 'src/engine/core-modules/emailing-domain/constants/send-slot-retry.constant';
import { type SendCampaignEmailBatchJobData } from 'src/engine/core-modules/emailing-domain/types/send-campaign-email-batch-job-data.type';
import { type SendSlotRefusal } from 'src/engine/core-modules/emailing-domain/types/send-slot-refusal.type';
import { applyReplacementTags } from 'src/engine/core-modules/emailing-domain/utils/apply-replacement-tags.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { SKIP_EVENT_EMISSION } from 'src/modules/emailing/constants/skip-event-emission.constant';
import { CampaignSendSlotService } from 'src/modules/emailing/services/campaign-send-slot.service';
import { CampaignVariableService } from 'src/modules/emailing/services/campaign-variable.service';
import { EmailBillingService } from 'src/modules/emailing/services/email-billing.service';
import { EmailingDomainSenderService } from 'src/modules/emailing/services/emailing-domain-sender.service';
import { MessageCampaignLifecycleService } from 'src/modules/emailing/services/message-campaign-lifecycle.service';
import { MessageCampaignStatisticsService } from 'src/modules/emailing/services/message-campaign-statistics.service';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';
import { type EmailingDomainEmailTemplate } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-email-template.type';
import { type CampaignBatchSendOutcome } from 'src/modules/emailing/types/campaign-batch-send-outcome.type';
import { type CampaignDeliverySettlement } from 'src/modules/emailing/types/campaign-delivery-settlement.type';
import { type EmailCreditContext } from 'src/modules/emailing/types/email-credit-context.type';
import { buildCampaignBatchReplacements } from 'src/modules/emailing/utils/build-campaign-batch-replacements.util';
import { buildCampaignDeliverySettleQuery } from 'src/modules/emailing/utils/build-campaign-delivery-settle-query.util';
import { compileCampaignBatchTemplate } from 'src/modules/emailing/utils/compile-campaign-batch-template.util';
import { chunkRecipientsToAdmissibleSize } from 'src/modules/emailing/utils/chunk-recipients-to-admissible-size.util';
import { computeSendSlotBackoffMs } from 'src/modules/emailing/utils/compute-send-slot-backoff-ms.util';
import { resolveCampaignBatchSettlements } from 'src/modules/emailing/utils/resolve-campaign-batch-settlements.util';
import { resolveCampaignSendFailure } from 'src/modules/emailing/utils/resolve-campaign-send-failure.util';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

type BatchRecipient = SendCampaignEmailBatchJobData['recipients'][number];

@Injectable()
export class MessageCampaignBatchDeliveryService {
  private readonly logger = new Logger(
    MessageCampaignBatchDeliveryService.name,
  );

  constructor(
    @InjectWorkspaceScopedRepository(CampaignDeliveryEntity)
    private readonly campaignDeliveryRepository: WorkspaceScopedRepository<CampaignDeliveryEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectMessageQueue(MessageQueue.campaignSendQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly emailingDomainSenderService: EmailingDomainSenderService,
    private readonly emailBillingService: EmailBillingService,
    private readonly campaignVariableService: CampaignVariableService,
    private readonly messageCampaignLifecycleService: MessageCampaignLifecycleService,
    private readonly messageCampaignStatisticsService: MessageCampaignStatisticsService,
    private readonly campaignSendSlotService: CampaignSendSlotService,
  ) {}

  async processSendBatchJob(
    data: SendCampaignEmailBatchJobData,
  ): Promise<void> {
    const { workspaceId, campaignId } = data;

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const campaign =
        await this.messageCampaignLifecycleService.findRunningCampaign(
          campaignId,
        );
      const creditContext =
        await this.emailBillingService.getEmailCreditContext(workspaceId);

      const claimToken = v4();
      const claimedDeliveryIds = await this.claimBatch({
        workspaceId,
        deliveryIds: data.recipients.map((recipient) => recipient.messageId),
        claimToken,
      });

      if (claimedDeliveryIds.length === 0) {
        return;
      }

      const claimedDeliveryIdSet = new Set(claimedDeliveryIds);
      const claimedRecipients = data.recipients.filter((recipient) =>
        claimedDeliveryIdSet.has(recipient.messageId),
      );

      try {
        await this.processClaimedBatch({
          data,
          campaign,
          creditContext,
          claimToken,
          claimedRecipients,
        });
      } finally {
        await this.requeueClaimsNeverHandedToProvider({
          workspaceId,
          claimToken,
        });
      }

      await this.messageCampaignStatisticsService
        .scheduleRefresh({ workspaceId, campaignId })
        .catch((error) => {
          this.logger.error(
            `Campaign ${campaignId} could not schedule a statistics refresh: ${
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

  private async processClaimedBatch({
    data,
    campaign,
    creditContext,
    claimToken,
    claimedRecipients,
  }: {
    data: SendCampaignEmailBatchJobData;
    campaign: MessageCampaignWorkspaceEntity | null;
    creditContext: EmailCreditContext;
    claimToken: string;
    claimedRecipients: BatchRecipient[];
  }): Promise<void> {
    const { workspaceId } = data;

    if (!isDefined(campaign)) {
      await this.settleWholeBatchAs({
        workspaceId,
        claimToken,
        recipients: claimedRecipients,
        state: CAMPAIGN_DELIVERY_STATE.SKIPPED,
        skipReason: CAMPAIGN_SKIP_REASON.CAMPAIGN_CANCELED,
      });

      return;
    }

    if (!creditContext.hasCredits) {
      await this.settleWholeBatchAs({
        workspaceId,
        claimToken,
        recipients: claimedRecipients,
        state: CAMPAIGN_DELIVERY_STATE.SKIPPED,
        skipReason: CAMPAIGN_SKIP_REASON.OUT_OF_CREDITS,
      });

      return;
    }

    const sendSlotRefusal =
      await this.campaignSendSlotService.findSendSlotRefusal({
        workspaceId,
        requestedSlotCount: claimedRecipients.length,
      });

    if (isDefined(sendSlotRefusal)) {
      await this.deferRateLimitedBatch({
        data,
        claimToken,
        claimedRecipients,
        sendSlotRefusal,
      });

      return;
    }

    const campaignStillRunning =
      await this.messageCampaignLifecycleService.findRunningCampaign(
        data.campaignId,
      );

    if (!isDefined(campaignStillRunning)) {
      await this.settleWholeBatchAs({
        workspaceId,
        claimToken,
        recipients: claimedRecipients,
        state: CAMPAIGN_DELIVERY_STATE.SKIPPED,
        skipReason: CAMPAIGN_SKIP_REASON.CAMPAIGN_CANCELED,
      });

      return;
    }

    await this.deliverBatch({
      data,
      campaign: campaignStillRunning,
      claimToken,
      claimedRecipients,
    });
  }

  private async deferRateLimitedBatch({
    data,
    claimToken,
    claimedRecipients,
    sendSlotRefusal,
  }: {
    data: SendCampaignEmailBatchJobData;
    claimToken: string;
    claimedRecipients: BatchRecipient[];
    sendSlotRefusal: SendSlotRefusal;
  }): Promise<void> {
    const { workspaceId } = data;
    const attemptCount = (data.rateLimitedAttemptCount ?? 0) + 1;

    if (attemptCount > SEND_SLOT_RETRY.attemptLimit) {
      await this.settleWholeBatchAs({
        workspaceId,
        claimToken,
        recipients: claimedRecipients,
        state: CAMPAIGN_DELIVERY_STATE.FAILED,
        failureReason: CAMPAIGN_FAILURE_REASON.RATE_LIMITED,
      });

      return;
    }

    await this.settleWholeBatchAs({
      workspaceId,
      claimToken,
      recipients: claimedRecipients,
      state: CAMPAIGN_DELIVERY_STATE.QUEUED,
    });

    // A workspace whose limit is below this batch can never admit it whole, so
    // re-queueing the same size would defer until the attempt limit and fail
    // recipients the provider would have taken. Split it to what fits instead.
    const chunks = chunkRecipientsToAdmissibleSize({
      recipients: claimedRecipients,
      limitValue: sendSlotRefusal.limitValue,
    });

    const delay = computeSendSlotBackoffMs({
      attemptCount,
      retryDelayMs: sendSlotRefusal.retryDelayMs,
      windowMs: sendSlotRefusal.windowMs,
    });

    await this.messageQueueService.bulkAdd<SendCampaignEmailBatchJobData>(
      SEND_CAMPAIGN_EMAIL_BATCH_JOB,
      chunks.map((chunk) => ({
        data: {
          ...data,
          recipients: chunk,
          // A split batch starts its own retry budget: it was never refused at
          // this size, and inheriting the count would fail it early.
          rateLimitedAttemptCount: chunks.length > 1 ? 0 : attemptCount,
        },
      })),
      {
        delay,
        retryLimit: CAMPAIGN_SEND_RETRY_LIMIT,
        backoff: CAMPAIGN_SEND_RETRY_BACKOFF,
      },
    );
  }

  private async deliverBatch({
    data,
    campaign,
    claimToken,
    claimedRecipients,
  }: {
    data: SendCampaignEmailBatchJobData;
    campaign: MessageCampaignWorkspaceEntity;
    claimToken: string;
    claimedRecipients: BatchRecipient[];
  }): Promise<void> {
    const { workspaceId, campaignId, emailingDomainId } = data;

    const { template, variableNames } = await compileCampaignBatchTemplate({
      subjectTemplate: campaign.subject ?? '',
      bodyTemplate: campaign.bodyTemplate ?? '',
    });

    const personRepository = this.workspaceOrmManager.getRepository(
      PersonWorkspaceEntity,
      { shouldBypassPermissionChecks: true },
    );

    const people = await personRepository.find({
      where: {
        id: In(claimedRecipients.map((recipient) => recipient.personId)),
      },
    });
    const personById = new Map(people.map((person) => [person.id, person]));

    const replacementsByDeliveryId = new Map<string, Record<string, string>>();

    for (const recipient of claimedRecipients) {
      const variables =
        await this.campaignVariableService.buildVariablesForPerson(
          workspaceId,
          personById.get(recipient.personId) ?? null,
        );

      replacementsByDeliveryId.set(
        recipient.messageId,
        buildCampaignBatchReplacements({ variableNames, variables }),
      );
    }

    const providerOutcome = await this.emailingDomainSenderService
      .sendEmailBatch({
        workspaceId,
        emailingDomainId,
        sendKind: 'MARKETING',
        from: campaign.fromAddress?.primaryEmail ?? '',
        template,
        recipients: claimedRecipients.map((recipient) => ({
          email: recipient.email,
          replacements: replacementsByDeliveryId.get(recipient.messageId) ?? {},
        })),
        unsubscribeTopicId: campaign.unsubscribeTopicId ?? undefined,
      })
      .catch(async (error) => {
        const { shouldRetry } = await this.recordBatchFailure({
          workspaceId,
          campaignId,
          claimToken,
          claimedRecipients,
          error,
        });

        if (shouldRetry) {
          throw error;
        }

        return null;
      });

    if (!isDefined(providerOutcome)) {
      return;
    }

    try {
      await this.settleDeliveredBatch({
        data,
        claimToken,
        claimedRecipients,
        outcome: providerOutcome,
        template,
        replacementsByDeliveryId,
      });
    } catch (error) {
      await this.settleClaimsAlreadyHandedToProvider({
        workspaceId,
        claimToken,
        settlements: resolveCampaignBatchSettlements({
          claimedRecipients,
          outcome: providerOutcome,
        }),
      });

      throw error;
    }
  }

  private async settleDeliveredBatch({
    data,
    claimToken,
    claimedRecipients,
    outcome,
    template,
    replacementsByDeliveryId,
  }: {
    data: SendCampaignEmailBatchJobData;
    claimToken: string;
    claimedRecipients: BatchRecipient[];
    outcome: CampaignBatchSendOutcome;
    template: EmailingDomainEmailTemplate;
    replacementsByDeliveryId: Map<string, Record<string, string>>;
  }): Promise<void> {
    const { workspaceId, campaignId, userWorkspaceId } = data;

    const settlements = resolveCampaignBatchSettlements({
      claimedRecipients,
      outcome,
    });

    const settledDeliveryIds = await this.settleClaimedBatch({
      workspaceId,
      claimToken,
      settlements,
    });

    const sentSettlements = settlements.filter(
      (settlement) =>
        settlement.state === CAMPAIGN_DELIVERY_STATE.SENT &&
        settledDeliveryIds.has(settlement.deliveryId) &&
        isDefined(settlement.providerMessageId),
    );

    for (const settlement of sentSettlements) {
      await this.recordSentMessage({
        deliveryId: settlement.deliveryId,
        providerMessageId: settlement.providerMessageId ?? '',
        template,
        replacements: replacementsByDeliveryId.get(settlement.deliveryId) ?? {},
      });
    }

    const sentDeliveryIds = sentSettlements.map(
      (settlement) => settlement.deliveryId,
    );

    await this.emailBillingService
      .billSentEmails({
        workspaceId,
        sentEmailCount: sentDeliveryIds.length,
        userWorkspaceId,
      })
      .catch((error) => {
        this.logger.error(
          `Campaign ${campaignId} delivered ${sentDeliveryIds.length} message(s) but failed to bill them: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      });
  }

  private async recordSentMessage({
    deliveryId,
    providerMessageId,
    template,
    replacements,
  }: {
    deliveryId: string;
    providerMessageId: string;
    template: EmailingDomainEmailTemplate;
    replacements: Record<string, string>;
  }): Promise<void> {
    const messageRepository = this.workspaceOrmManager.getRepository(
      MessageWorkspaceEntity,
      { shouldBypassPermissionChecks: true },
      SKIP_EVENT_EMISSION,
    );

    await messageRepository.update(deliveryId, {
      headerMessageId: providerMessageId,
      subject: applyReplacementTags(template.subject, replacements),
      text: applyReplacementTags(template.text, replacements),
    });

    const associationRepository = this.workspaceOrmManager.getRepository(
      MessageChannelMessageAssociationWorkspaceEntity,
      { shouldBypassPermissionChecks: true },
      SKIP_EVENT_EMISSION,
    );

    await associationRepository.update(
      { messageId: deliveryId },
      {
        messageExternalId: providerMessageId,
        messageThreadExternalId: providerMessageId,
      },
    );
  }

  private async recordBatchFailure({
    workspaceId,
    campaignId,
    claimToken,
    claimedRecipients,
    error,
  }: {
    workspaceId: string;
    campaignId: string;
    claimToken: string;
    claimedRecipients: BatchRecipient[];
    error: unknown;
  }): Promise<{ shouldRetry: boolean }> {
    const { state, skipReason, failureReason, shouldRetry } =
      resolveCampaignSendFailure(error);

    await this.settleWholeBatchAs({
      workspaceId,
      claimToken,
      recipients: claimedRecipients,
      state: shouldRetry ? CAMPAIGN_DELIVERY_STATE.QUEUED : state,
      skipReason,
      failureReason,
    });

    this.logger.warn(
      `Campaign ${campaignId} batch of ${claimedRecipients.length} failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );

    return { shouldRetry };
  }

  private async claimBatch({
    workspaceId,
    deliveryIds,
    claimToken,
  }: {
    workspaceId: string;
    deliveryIds: string[];
    claimToken: string;
  }): Promise<string[]> {
    const { raw } = await this.campaignDeliveryRepository
      .createQueryBuilder()
      .update()
      .set({
        state: CAMPAIGN_DELIVERY_STATE.SENDING,
        claimToken,
        claimExpiresAt: new Date(Date.now() + CAMPAIGN_DELIVERY_CLAIM_TTL_MS),
      })
      .where('"workspaceId" = :workspaceId', { workspaceId })
      .andWhere('id IN (:...deliveryIds)', { deliveryIds })
      .andWhere('state IN (:...claimableStates)', {
        claimableStates: CLAIMABLE_CAMPAIGN_DELIVERY_STATES,
      })
      .returning(['id'])
      .execute();

    return (raw as { id: string }[]).map((row) => row.id);
  }

  private async settleWholeBatchAs({
    workspaceId,
    claimToken,
    recipients,
    state,
    skipReason = null,
    failureReason = null,
  }: {
    workspaceId: string;
    claimToken: string;
    recipients: BatchRecipient[];
    state: CampaignDeliveryEntity['state'];
    skipReason?: CampaignDeliveryEntity['skipReason'];
    failureReason?: CampaignDeliveryEntity['failureReason'];
  }): Promise<void> {
    if (recipients.length === 0) {
      return;
    }

    await this.campaignDeliveryRepository.update(
      workspaceId,
      {
        id: In(recipients.map((recipient) => recipient.messageId)),
        claimToken,
      },
      {
        state,
        skipReason,
        failureReason,
        claimToken: null,
        claimExpiresAt: null,
      },
    );
  }

  private async settleClaimedBatch({
    workspaceId,
    claimToken,
    settlements,
  }: {
    workspaceId: string;
    claimToken: string;
    settlements: CampaignDeliverySettlement[];
  }): Promise<Set<string>> {
    if (settlements.length === 0) {
      return new Set();
    }

    const { sql, parameters } = buildCampaignDeliverySettleQuery({
      workspaceId,
      claimToken,
      settlements,
    });

    const settledRows: { id: string }[] = await this.dataSource.query(
      sql,
      parameters,
    );

    return new Set(settledRows.map((row) => row.id));
  }

  private async requeueClaimsNeverHandedToProvider({
    workspaceId,
    claimToken,
  }: {
    workspaceId: string;
    claimToken: string;
  }): Promise<void> {
    await this.campaignDeliveryRepository.update(
      workspaceId,
      { claimToken },
      {
        state: CAMPAIGN_DELIVERY_STATE.QUEUED,
        claimToken: null,
        claimExpiresAt: null,
      },
    );
  }

  // Settling threw after the provider had already taken the batch, so the rows
  // still hold their claim. Recording them all one way is wrong in both
  // directions: sent would count recipients the provider rejected, and failed
  // is claimable and would mail the accepted ones again.
  //
  // The rows the provider accepted are released first, in one statement. If the
  // second write then fails, the finally block re-queues whatever is still
  // claimed, and only recipients the provider never delivered to are in that
  // set, so a retry cannot re-send mail that already went out.
  private async settleClaimsAlreadyHandedToProvider({
    workspaceId,
    claimToken,
    settlements,
  }: {
    workspaceId: string;
    claimToken: string;
    settlements: CampaignDeliverySettlement[];
  }): Promise<void> {
    const acceptedDeliveryIds = settlements
      .filter((settlement) => settlement.state === CAMPAIGN_DELIVERY_STATE.SENT)
      .map((settlement) => settlement.deliveryId);

    if (acceptedDeliveryIds.length > 0) {
      await this.campaignDeliveryRepository.update(
        workspaceId,
        { id: In(acceptedDeliveryIds), claimToken },
        {
          state: CAMPAIGN_DELIVERY_STATE.SENT,
          failureReason: CAMPAIGN_FAILURE_REASON.SETTLEMENT_LOST,
          claimToken: null,
          claimExpiresAt: null,
        },
      );
    }

    for (const settlement of settlements) {
      if (settlement.state === CAMPAIGN_DELIVERY_STATE.SENT) {
        continue;
      }

      await this.campaignDeliveryRepository.update(
        workspaceId,
        { id: settlement.deliveryId, claimToken },
        {
          state: settlement.state,
          skipReason: settlement.skipReason,
          failureReason: settlement.failureReason,
          claimToken: null,
          claimExpiresAt: null,
        },
      );
    }
  }
}
