import { Injectable, Logger } from '@nestjs/common';

import { In } from 'typeorm';

import { CampaignDeliveryEntity } from 'src/engine/core-modules/emailing-domain/campaign-delivery.entity';
import { CAMPAIGN_DELIVERY_CLAIM_TTL_MS } from 'src/engine/core-modules/emailing-domain/constants/campaign-delivery-claim-ttl-ms.constant';
import { CAMPAIGN_DELIVERY_STATE } from 'src/engine/core-modules/emailing-domain/constants/campaign-delivery-state.constant';
import { CAMPAIGN_SKIP_REASON } from 'src/engine/core-modules/emailing-domain/constants/campaign-skip-reason.constant';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { v4 } from 'uuid';
import { type EmailingDomainEmailContent } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-email-content.type';
import { type EmailingDomainSendEmailResult } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-result.type';
import { type SendCampaignEmailJobData } from 'src/engine/core-modules/emailing-domain/types/send-campaign-email-job-data.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceRepositoryV2 } from 'src/engine/twenty-orm-v2/repository/workspace-repository-v2';
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

type MessageRepository = WorkspaceRepositoryV2<MessageWorkspaceEntity>;

type SendContext = {
  campaign: MessageCampaignWorkspaceEntity;
  person: PersonWorkspaceEntity | null;
  claimToken: string;
};

@Injectable()
export class MessageCampaignDeliveryService {
  private readonly logger = new Logger(MessageCampaignDeliveryService.name);

  constructor(
    @InjectWorkspaceScopedRepository(CampaignDeliveryEntity)
    private readonly campaignDeliveryRepository: WorkspaceScopedRepository<CampaignDeliveryEntity>,
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

      const sendContext = await this.loadSendContext({ data });

      if (!isDefined(sendContext)) {
        return;
      }

      // No release on an unexpected throw: the lease expires on its own, so
      // the crash path and the throw path settle identically.
      await this.deliverMessage({ data, messageRepository, sendContext });

      await this.messageCampaignLifecycleService.finalizeCampaignIfComplete({
        workspaceId,
        campaignId,
      });
    }, buildSystemAuthContext(workspaceId));
  }

  private async loadSendContext({
    data,
  }: {
    data: SendCampaignEmailJobData;
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

    const personRepository = await this.globalWorkspaceOrmManager.getRepository(
      workspaceId,
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
      userWorkspaceId,
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

    const { hasCredits, currentBillingSubscription } =
      await this.emailBillingService.resolveEmailCreditContext(workspaceId);

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

    await messageRepository.update(messageId, {
      headerMessageId: result.messageId,
      subject,
      text: plainText,
    });

    const affected = await this.settleClaimedDelivery({
      workspaceId,
      messageId,
      claimToken,
      update: {
        state: CAMPAIGN_DELIVERY_STATE.SENT,
        providerMessageId: result.messageId,
        sentAt: new Date(),
      },
    });

    if (affected !== 1) {
      this.logger.warn(
        `Campaign ${campaignId} delivered message ${messageId} but another worker owns the claim, so this send is recorded by neither and is not billed`,
      );

      return;
    }

    await this.emailBillingService
      .billSentEmails({
        workspaceId,
        sentEmailCount: 1,
        userWorkspaceId,
        currentBillingSubscription,
      })
      .catch((error) => {
        this.logger.error(
          `Campaign ${campaignId} delivered message ${messageId} but failed to bill it, so this send is unbilled: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
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
      update: { state, skipReason, failureReason },
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
        state: In([
          CAMPAIGN_DELIVERY_STATE.QUEUED,
          CAMPAIGN_DELIVERY_STATE.FAILED,
        ]),
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
