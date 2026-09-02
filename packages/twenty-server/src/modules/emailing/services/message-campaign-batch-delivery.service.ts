import { Injectable, Logger } from '@nestjs/common';

import { In } from 'typeorm';
import { v4 } from 'uuid';

import { CampaignDeliveryEntity } from 'src/engine/core-modules/emailing-domain/campaign-delivery.entity';
import { CAMPAIGN_DELIVERY_CLAIM_TTL_MS } from 'src/engine/core-modules/emailing-domain/constants/campaign-delivery-claim-ttl-ms.constant';
import { CAMPAIGN_DELIVERY_STATE } from 'src/engine/core-modules/emailing-domain/constants/campaign-delivery-state.constant';
import { CAMPAIGN_SKIP_REASON } from 'src/engine/core-modules/emailing-domain/constants/campaign-skip-reason.constant';
import { CLAIMABLE_CAMPAIGN_DELIVERY_STATES } from 'src/engine/core-modules/emailing-domain/constants/claimable-campaign-delivery-states.constant';
import { type SendCampaignEmailBatchJobData } from 'src/engine/core-modules/emailing-domain/types/send-campaign-email-batch-job-data.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { UsageLimitSpeedService } from 'src/engine/core-modules/usage-limit/services/usage-limit-speed.service';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { CampaignVariableService } from 'src/modules/emailing/services/campaign-variable.service';
import { EmailBillingService } from 'src/modules/emailing/services/email-billing.service';
import { EmailingDomainSenderService } from 'src/modules/emailing/services/emailing-domain-sender.service';
import { MessageCampaignLifecycleService } from 'src/modules/emailing/services/message-campaign-lifecycle.service';
import { MessageCampaignStatisticsService } from 'src/modules/emailing/services/message-campaign-statistics.service';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';
import { applyReplacementTags } from 'src/engine/core-modules/emailing-domain/utils/apply-replacement-tags.util';
import { buildCampaignBatchReplacements } from 'src/modules/emailing/utils/build-campaign-batch-replacements.util';
import { compileCampaignBatchTemplate } from 'src/modules/emailing/utils/compile-campaign-batch-template.util';
import { resolveCampaignSendFailure } from 'src/modules/emailing/utils/resolve-campaign-send-failure.util';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { MessageCampaignStatus } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const SKIP_EVENT_EMISSION = { shouldSkipEventEmission: true };

@Injectable()
export class MessageCampaignBatchDeliveryService {
  private readonly logger = new Logger(
    MessageCampaignBatchDeliveryService.name,
  );

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
  ) {}

  async processSendBatchJob(
    data: SendCampaignEmailBatchJobData,
  ): Promise<void> {
    const { workspaceId, campaignId } = data;

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const claimToken = v4();
      const claimedMessageIds = await this.claimBatch({
        workspaceId,
        messageIds: data.recipients.map((recipient) => recipient.messageId),
        claimToken,
      });

      if (claimedMessageIds.length === 0) {
        return;
      }

      const claimedRecipients = data.recipients.filter((recipient) =>
        claimedMessageIds.includes(recipient.messageId),
      );

      const creditContext =
        await this.emailBillingService.resolveEmailCreditContext(workspaceId);

      const hasSendSlots = await this.consumeSendSlots({
        workspaceId,
        count: claimedRecipients.length,
      });

      if (!hasSendSlots) {
        await this.settleClaimed({
          workspaceId,
          messageIds: claimedMessageIds,
          claimToken,
          update: { state: CAMPAIGN_DELIVERY_STATE.QUEUED },
        });

        return;
      }

      if (!creditContext.hasCredits) {
        await this.settleClaimed({
          workspaceId,
          messageIds: claimedMessageIds,
          claimToken,
          update: {
            state: CAMPAIGN_DELIVERY_STATE.SKIPPED,
            skipReason: CAMPAIGN_SKIP_REASON.OUT_OF_CREDITS,
          },
        });

        return;
      }

      const campaign = await this.findRunningCampaign(campaignId);

      if (!isDefined(campaign)) {
        await this.settleClaimed({
          workspaceId,
          messageIds: claimedMessageIds,
          claimToken,
          update: {
            state: CAMPAIGN_DELIVERY_STATE.SKIPPED,
            skipReason: CAMPAIGN_SKIP_REASON.CAMPAIGN_CANCELED,
          },
        });

        return;
      }

      await this.deliverBatch({
        data,
        campaign,
        claimToken,
        claimedRecipients,
      });

      await this.messageCampaignStatisticsService.scheduleRefresh({
        workspaceId,
        campaignId,
      });

      await this.messageCampaignLifecycleService.finalizeCampaignIfComplete({
        workspaceId,
        campaignId,
      });
    }, buildSystemAuthContext(workspaceId));
  }

  private async consumeSendSlots({
    workspaceId,
    count,
  }: {
    workspaceId: string;
    count: number;
  }): Promise<boolean> {
    try {
      await this.usageLimitSpeedService.consumeOrThrow({
        resourceType: UsageResourceType.EMAIL,
        operationType: UsageOperationType.EMAIL_SEND,
        authContext: buildSystemAuthContext(workspaceId),
        cost: count,
      });

      return true;
    } catch (error) {
      if (
        error instanceof UsageLimitException &&
        error.code === UsageLimitExceptionCode.RATE_LIMITED
      ) {
        return false;
      }

      throw error;
    }
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
    claimedRecipients: SendCampaignEmailBatchJobData['recipients'];
  }): Promise<void> {
    const { workspaceId, campaignId, emailingDomainId, userWorkspaceId } = data;

    const { template, variableNames } = await compileCampaignBatchTemplate({
      subjectTemplate: campaign.subject ?? '',
      bodyTemplate: campaign.bodyTemplate ?? '',
    });

    const personRepository = this.workspaceOrmManager.getRepository(
      PersonWorkspaceEntity,
      { shouldBypassPermissionChecks: true },
    );

    const people = await personRepository.find({
      where: { id: In(claimedRecipients.map((r) => r.personId)) },
    });
    const personById = new Map(people.map((person) => [person.id, person]));

    const replacementsByMessageId = new Map<string, Record<string, string>>();

    for (const recipient of claimedRecipients) {
      const variables =
        await this.campaignVariableService.buildVariablesForPerson(
          workspaceId,
          personById.get(recipient.personId) ?? null,
        );

      replacementsByMessageId.set(
        recipient.messageId,
        buildCampaignBatchReplacements({ variableNames, variables }),
      );
    }

    const outcome = await this.emailingDomainSenderService
      .sendEmailBatch({
        workspaceId,
        emailingDomainId,
        sendKind: 'MARKETING',
        from: campaign.fromAddress?.primaryEmail ?? '',
        template,
        recipients: claimedRecipients.map((recipient) => ({
          email: recipient.email,
          replacements: replacementsByMessageId.get(recipient.messageId) ?? {},
        })),
        unsubscribeTopicId: campaign.unsubscribeTopicId ?? undefined,
      })
      .catch(async (error) => {
        await this.recordBatchFailure({
          workspaceId,
          campaignId,
          messageIds: claimedRecipients.map((r) => r.messageId),
          claimToken,
          error,
        });

        throw error;
      });

    const recipientByEmail = new Map(
      claimedRecipients.map((recipient) => [recipient.email, recipient]),
    );

    const sentMessageIds: string[] = [];

    for (const entry of outcome.entries) {
      const recipient = recipientByEmail.get(entry.email);

      if (!isDefined(recipient)) {
        continue;
      }

      if (!isDefined(entry.messageId)) {
        const { state, skipReason, failureReason } = resolveCampaignSendFailure(
          new Error(entry.errorMessage ?? 'Provider rejected the destination'),
        );

        await this.settleClaimed({
          workspaceId,
          messageIds: [recipient.messageId],
          claimToken,
          update: { state, skipReason, failureReason },
        });

        continue;
      }

      const affected = await this.settleClaimed({
        workspaceId,
        messageIds: [recipient.messageId],
        claimToken,
        update: {
          state: CAMPAIGN_DELIVERY_STATE.SENT,
          providerMessageId: entry.messageId,
          sentAt: new Date(),
          failureReason: null,
          skipReason: null,
        },
      });

      if (affected !== 1) {
        this.logger.warn(
          `Campaign ${campaignId} delivered message ${recipient.messageId} but another worker owns the claim, so this send is recorded by neither and is not billed`,
        );

        continue;
      }

      sentMessageIds.push(recipient.messageId);

      await this.recordSentMessage({
        messageId: recipient.messageId,
        providerMessageId: entry.messageId,
        template,
        replacements: replacementsByMessageId.get(recipient.messageId) ?? {},
      });
    }

    for (const email of outcome.suppressedEmails) {
      const recipient = recipientByEmail.get(email);

      if (isDefined(recipient)) {
        await this.settleClaimed({
          workspaceId,
          messageIds: [recipient.messageId],
          claimToken,
          update: {
            state: CAMPAIGN_DELIVERY_STATE.SKIPPED,
            skipReason: CAMPAIGN_SKIP_REASON.SUPPRESSED,
          },
        });
      }
    }

    if (sentMessageIds.length > 0) {
      await this.emailBillingService
        .billSentEmails({
          workspaceId,
          sentEmailCount: sentMessageIds.length,
          userWorkspaceId,
        })
        .catch((error) => {
          this.logger.error(
            `Campaign ${campaignId} delivered ${sentMessageIds.length} message(s) but failed to bill them: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        });
    }
  }

  private async recordSentMessage({
    messageId,
    providerMessageId,
    template,
    replacements,
  }: {
    messageId: string;
    providerMessageId: string;
    template: { subject: string; text: string };
    replacements: Record<string, string>;
  }): Promise<void> {
    const messageRepository = this.workspaceOrmManager.getRepository(
      MessageWorkspaceEntity,
      { shouldBypassPermissionChecks: true },
      SKIP_EVENT_EMISSION,
    );

    await messageRepository.update(messageId, {
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
      { messageId },
      {
        messageExternalId: providerMessageId,
        messageThreadExternalId: providerMessageId,
      },
    );
  }

  private async recordBatchFailure({
    workspaceId,
    campaignId,
    messageIds,
    claimToken,
    error,
  }: {
    workspaceId: string;
    campaignId: string;
    messageIds: string[];
    claimToken: string;
    error: unknown;
  }): Promise<void> {
    const { state, skipReason, failureReason, shouldRetry } =
      resolveCampaignSendFailure(error);

    await this.settleClaimed({
      workspaceId,
      messageIds,
      claimToken,
      update: shouldRetry
        ? { state: CAMPAIGN_DELIVERY_STATE.QUEUED, skipReason, failureReason }
        : { state, skipReason, failureReason },
    });

    this.logger.warn(
      `Campaign ${campaignId} batch of ${messageIds.length} failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
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

  private async claimBatch({
    workspaceId,
    messageIds,
    claimToken,
  }: {
    workspaceId: string;
    messageIds: string[];
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
      .andWhere('id IN (:...messageIds)', { messageIds })
      .andWhere('state IN (:...claimableStates)', {
        claimableStates: CLAIMABLE_CAMPAIGN_DELIVERY_STATES,
      })
      .returning(['id'])
      .execute();

    return (raw as { id: string }[]).map((row) => row.id);
  }

  private async settleClaimed({
    workspaceId,
    messageIds,
    claimToken,
    update,
  }: {
    workspaceId: string;
    messageIds: string[];
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
      { id: In(messageIds), claimToken },
      { ...update, claimToken: null, claimExpiresAt: null },
    );

    return affected ?? 0;
  }
}
