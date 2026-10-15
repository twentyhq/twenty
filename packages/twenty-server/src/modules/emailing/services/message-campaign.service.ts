import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { MessageCampaignStatus } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { CAMPAIGN_SEND_RETRY_BACKOFF } from 'src/engine/core-modules/emailing-domain/constants/campaign-send-retry-backoff.constant';
import { CAMPAIGN_SEND_RETRY_LIMIT } from 'src/engine/core-modules/emailing-domain/constants/campaign-send-retry-limit.constant';
import { MATERIALIZE_CAMPAIGN_JOB } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { type PreviewMessageCampaignSendOutputDTO } from 'src/engine/core-modules/emailing-domain/dtos/preview-message-campaign-send-output.dto';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { type EmailingDomainSendEmailResult } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-result.type';
import { UnsubscribeHostnameStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/unsubscribe-hostname-status.type';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { type CampaignAudienceResolution } from 'src/engine/core-modules/emailing-domain/types/campaign-audience-resolution.type';
import { type MaterializeCampaignJobData } from 'src/engine/core-modules/emailing-domain/types/materialize-campaign-job-data.type';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { MessageChannelMetadataService } from 'src/engine/metadata-modules/message-channel/message-channel-metadata.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { CampaignVariableService } from 'src/modules/emailing/services/campaign-variable.service';
import { EmailBillingService } from 'src/modules/emailing/services/email-billing.service';
import { buildCampaignNotSendableExceptions } from 'src/modules/emailing/utils/build-campaign-not-sendable-exceptions.util';
import { buildCampaignSendRefusalException } from 'src/modules/emailing/utils/build-campaign-send-refusal-exception.util';
import { EmailingDomainSenderService } from 'src/modules/emailing/services/emailing-domain-sender.service';
import { MessageCampaignAudienceService } from 'src/modules/emailing/services/message-campaign-audience.service';
import { MessageCampaignLifecycleService } from 'src/modules/emailing/services/message-campaign-lifecycle.service';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';
import { type PreparedCampaignSend } from 'src/modules/emailing/types/prepared-campaign-send.type';
import { type SendCampaignResult } from 'src/modules/emailing/types/send-campaign-result.type';
import { collectCampaignVariableNamesFromTemplates } from 'src/modules/emailing/utils/collect-campaign-variable-names-from-templates.util';
import { renderCampaignEmail } from 'src/modules/emailing/utils/render-campaign-email.util';
import { sendableCampaignSchema } from 'src/modules/emailing/zod-schemas/sendable-campaign.zod-schema';
import { getDomainFromEmail } from 'src/utils/get-domain-from-email';
import { buildEmailingRolePermissionConfig } from 'src/modules/emailing/utils/build-emailing-role-permission-config.util';

type SendableCampaign = z.infer<typeof sendableCampaignSchema>;

type CampaignSendCheck = {
  sendBlockers: EmailingDomainException[];
  audience: CampaignAudienceResolution['audience'] | null;
  readyToSend: {
    campaign: SendableCampaign;
    emailingDomain: EmailingDomainEntity;
    audienceResolution: CampaignAudienceResolution;
  } | null;
};

const TEST_SEND_THROTTLE = { maxRequests: 3, windowMs: 24 * 60 * 60 * 1000 };

@Injectable()
export class MessageCampaignService {
  constructor(
    @InjectWorkspaceScopedRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: WorkspaceScopedRepository<EmailingDomainEntity>,
    @InjectMessageQueue(MessageQueue.campaignQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly emailingDomainSenderService: EmailingDomainSenderService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly messageChannelMetadataService: MessageChannelMetadataService,
    private readonly userRoleService: UserRoleService,
    private readonly campaignVariableService: CampaignVariableService,
    private readonly messageCampaignAudienceService: MessageCampaignAudienceService,
    private readonly messageCampaignLifecycleService: MessageCampaignLifecycleService,
    private readonly throttlerService: ThrottlerService,
    private readonly emailBillingService: EmailBillingService,
    private readonly i18nService: I18nService,
  ) {}

  async send({
    workspaceId,
    userWorkspaceId,
    campaignId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    campaignId: string;
  }): Promise<SendCampaignResult> {
    const prepared = await this.prepareCampaignSendOrThrow({
      workspaceId,
      userWorkspaceId,
      campaignId,
    });

    return this.claimAndMaterializeOrThrow({
      workspaceId,
      userWorkspaceId,
      campaignId,
      prepared,
      from: prepared.expectedStatus,
      fromScheduledAt: prepared.expectedScheduledAt ?? undefined,
    });
  }

  async previewSend({
    workspaceId,
    userWorkspaceId,
    campaignId,
    scheduledAt,
    locale,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    campaignId: string;
    scheduledAt?: Date;
    locale?: keyof typeof APP_LOCALES;
  }): Promise<PreviewMessageCampaignSendOutputDTO> {
    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      workspaceId,
      userWorkspaceId,
    });

    const { sendBlockers, audience } = await this.checkCampaignSend({
      workspaceId,
      userWorkspaceId,
      campaignId,
      roleId,
      scheduledAt,
    });

    if (audience?.sendable === 0) {
      sendBlockers.push(
        new EmailingDomainException(
          `Campaign ${campaignId} has no sendable recipient`,
          EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NO_SENDABLE_RECIPIENTS,
        ),
      );
    }

    const i18n = this.i18nService.getI18nInstance(locale ?? SOURCE_LOCALE);

    return {
      audience,
      blockers: sendBlockers.map((sendBlocker) => ({
        code: sendBlocker.code,
        message: i18n._(sendBlocker.userFriendlyMessage),
      })),
    };
  }

  async prepareCampaignSendOrThrow({
    workspaceId,
    userWorkspaceId,
    campaignId,
    scheduledAt,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    campaignId: string;
    scheduledAt?: Date;
  }): Promise<PreparedCampaignSend> {
    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      workspaceId,
      userWorkspaceId,
    });

    const { sendBlockers, readyToSend } = await this.checkCampaignSend({
      workspaceId,
      userWorkspaceId,
      campaignId,
      roleId,
      scheduledAt,
    });

    if (!isDefined(readyToSend)) {
      throw sendBlockers[0];
    }

    const { campaign, emailingDomain, audienceResolution } = readyToSend;

    const messageChannel =
      await this.messageChannelMetadataService.getOrCreateEmailGroupChannel({
        fromAddress: campaign.fromAddress.primaryEmail,
        userWorkspaceId,
        workspaceId,
      });

    return {
      roleId,
      emailingDomainId: emailingDomain.id,
      messageChannelId: messageChannel.id,
      sendableRecipients: audienceResolution.sendableRecipients,
      audience: audienceResolution.audience,
      expectedStatus: campaign.status,
      expectedScheduledAt: campaign.scheduledAt ?? null,
    };
  }

  async claimAndMaterializeOrThrow({
    workspaceId,
    userWorkspaceId,
    campaignId,
    prepared,
    from,
    fromScheduledAt,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    campaignId: string;
    prepared: PreparedCampaignSend;
    from: MessageCampaignStatus;
    fromScheduledAt?: Date;
  }): Promise<SendCampaignResult> {
    const { roleId, emailingDomainId, messageChannelId, sendableRecipients } =
      prepared;

    const claimed =
      await this.messageCampaignLifecycleService.transitionCampaignStatus({
        workspaceId,
        campaignId,
        roleId,
        from,
        to: MessageCampaignStatus.SENDING,
        scheduledAt: null,
        fromScheduledAt,
      });

    if (!claimed) {
      throw new EmailingDomainException(
        `Campaign ${campaignId} is no longer sendable from ${from}`,
        EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE,
      );
    }

    await this.messageQueueService
      .add<MaterializeCampaignJobData>(
        MATERIALIZE_CAMPAIGN_JOB,
        {
          workspaceId,
          campaignId,
          messageChannelId,
          emailingDomainId,
          userWorkspaceId,
          recipients: sendableRecipients,
        },
        {
          retryLimit: CAMPAIGN_SEND_RETRY_LIMIT,
          backoff: CAMPAIGN_SEND_RETRY_BACKOFF,
        },
      )
      .catch(async (error) => {
        await this.messageCampaignLifecycleService.transitionCampaignStatus({
          workspaceId,
          campaignId,
          roleId,
          from: MessageCampaignStatus.SENDING,
          to: from,
          scheduledAt: fromScheduledAt ?? null,
        });

        throw error;
      });

    return {
      campaignId,
      queuedCount: sendableRecipients.length,
      audience: prepared.audience,
    };
  }

  async sendTest({
    workspaceId,
    toAddress,
    subject,
    html,
    fromAddress,
    unsubscribeTopicId,
  }: {
    workspaceId: string;
    toAddress: string;
    subject: string;
    html: string;
    fromAddress: string;
    unsubscribeTopicId?: string;
  }): Promise<EmailingDomainSendEmailResult> {
    const emailingDomain = await this.findSendReadyEmailingDomainOrThrow({
      workspaceId,
      fromAddress,
    });

    const variables =
      await this.campaignVariableService.buildVariablesForPerson(
        workspaceId,
        null,
      );
    const rendered = await renderCampaignEmail({
      subjectTemplate: subject,
      bodyTemplate: html,
      variables,
    });

    await this.throttlerService.tokenBucketThrottleOrThrow(
      `message-campaign-test-send:throttler:${workspaceId}`,
      1,
      TEST_SEND_THROTTLE.maxRequests,
      TEST_SEND_THROTTLE.windowMs,
    );

    return this.emailingDomainSenderService.sendEmail(
      workspaceId,
      emailingDomain.id,
      {
        from: fromAddress,
        to: [toAddress],
        subject: rendered.subject,
        text: rendered.plainText,
        html: rendered.html,
        sendKind: 'MARKETING',
        unsubscribeTopicId,
      },
    );
  }

  private async findSendReadyEmailingDomainOrThrow({
    workspaceId,
    fromAddress,
  }: {
    workspaceId: string;
    fromAddress: string;
  }): Promise<EmailingDomainEntity> {
    const emailingDomain = await this.emailingDomainRepository.findOne(
      workspaceId,
      {
        where: {
          domain: getDomainFromEmail(fromAddress)?.toLowerCase(),
          status: EmailingDomainStatus.VERIFIED,
        },
      },
    );

    if (!isDefined(emailingDomain)) {
      throw new EmailingDomainException(
        `No verified emailing domain matches the from address ${fromAddress}`,
        EmailingDomainExceptionCode.EMAILING_DOMAIN_NOT_VERIFIED,
      );
    }

    if (
      emailingDomain.unsubscribeHostnameStatus !==
        UnsubscribeHostnameStatus.ACTIVE ||
      !isNonEmptyString(emailingDomain.unsubscribeHostname)
    ) {
      throw new EmailingDomainException(
        `Cannot send email for ${emailingDomain.domain}: unsubscribe domain is not active (status: ${emailingDomain.unsubscribeHostnameStatus})`,
        EmailingDomainExceptionCode.EMAILING_DOMAIN_UNSUBSCRIBE_NOT_READY,
      );
    }

    return emailingDomain;
  }

  private async checkCampaignSend({
    workspaceId,
    userWorkspaceId,
    campaignId,
    roleId,
    scheduledAt,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    campaignId: string;
    roleId: string;
    scheduledAt?: Date;
  }): Promise<CampaignSendCheck> {
    const campaign = await this.workspaceOrmManager.executeInWorkspaceContext(
      () => this.findCampaignOrThrow({ campaignId, roleId }),
    );

    const sendableCampaign = sendableCampaignSchema.safeParse(campaign);

    const sendBlockers = sendableCampaign.success
      ? []
      : buildCampaignNotSendableExceptions({
          campaignId,
          issues: sendableCampaign.error.issues,
        });

    const isListInTrash =
      isDefined(campaign.listId) &&
      (!isDefined(campaign.list) || isDefined(campaign.list.deletedAt));

    if (isListInTrash) {
      sendBlockers.push(
        new EmailingDomainException(
          `Campaign ${campaignId} is not sendable: list ${campaign.listId} is in the trash`,
          EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE,
          {
            userFriendlyMessage: msg`This campaign's list is in the trash. Restore it or pick another list in the To field.`,
          },
        ),
      );
    }

    if (isDefined(scheduledAt) && scheduledAt.getTime() <= Date.now()) {
      sendBlockers.push(
        new EmailingDomainException(
          `Campaign ${campaignId} cannot be scheduled for ${scheduledAt.toISOString()}, which is not in the future`,
          EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_SCHEDULE_NOT_IN_FUTURE,
        ),
      );
    }

    await this.campaignVariableService
      .assertKnownVariables(
        workspaceId,
        collectCampaignVariableNamesFromTemplates({
          subject: campaign.subject ?? '',
          bodyTemplate: campaign.bodyTemplate ?? '',
        }),
      )
      .catch((error) =>
        this.collectSendBlockerOrThrow({ error, sendBlockers }),
      );

    const fromAddress = campaign.fromAddress?.primaryEmail;

    const emailingDomain = isNonEmptyString(fromAddress)
      ? await this.findSendReadyEmailingDomainOrThrow({
          workspaceId,
          fromAddress,
        }).catch((error) =>
          this.collectSendBlockerOrThrow({ error, sendBlockers }),
        )
      : null;

    const audienceResolution =
      isDefined(campaign.listId) && !isListInTrash
        ? await this.messageCampaignAudienceService.resolveNormalizedAudience({
            workspaceId,
            listId: campaign.listId,
            roleId,
            unsubscribeTopicId: campaign.unsubscribeTopicId ?? undefined,
          })
        : null;

    const sendableRecipientCount =
      audienceResolution?.sendableRecipients.length ?? 0;

    if (sendableRecipientCount > 0) {
      const sendRefusal = await this.emailBillingService.findEmailSendRefusal({
        workspaceId,
        spenders: { userWorkspaceId },
      });

      if (isDefined(sendRefusal)) {
        sendBlockers.push(
          buildCampaignSendRefusalException({
            campaignId,
            recipientCount: sendableRecipientCount,
            sendRefusal,
          }),
        );
      }
    }

    const audience = audienceResolution?.audience ?? null;

    if (
      sendBlockers.length > 0 ||
      !sendableCampaign.success ||
      !isDefined(emailingDomain) ||
      !isDefined(audienceResolution)
    ) {
      return { sendBlockers, audience, readyToSend: null };
    }

    return {
      sendBlockers,
      audience,
      readyToSend: {
        campaign: sendableCampaign.data,
        emailingDomain,
        audienceResolution,
      },
    };
  }

  private collectSendBlockerOrThrow({
    error,
    sendBlockers,
  }: {
    error: unknown;
    sendBlockers: EmailingDomainException[];
  }): null {
    if (!(error instanceof EmailingDomainException)) {
      throw error;
    }

    sendBlockers.push(error);

    return null;
  }

  private async findCampaignOrThrow({
    campaignId,
    roleId,
  }: {
    campaignId: string;
    roleId: string;
  }): Promise<MessageCampaignWorkspaceEntity> {
    const campaignRepository = this.workspaceOrmManager.getRepository(
      MessageCampaignWorkspaceEntity,
      buildEmailingRolePermissionConfig(roleId),
    );

    const campaign = await campaignRepository.findOne({
      where: { id: campaignId },
      relations: { list: true },
    });

    if (!isDefined(campaign)) {
      throw new EmailingDomainException(
        `Campaign ${campaignId} not found`,
        EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_FOUND,
      );
    }

    return campaign;
  }
}
