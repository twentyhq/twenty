import { Injectable, Logger, type Type } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { z } from 'zod';
import { In, type ObjectLiteral } from 'typeorm';
import { v4, v5 } from 'uuid';

import {
  CAMPAIGN_MESSAGE_DELIVERY_STATUS,
  CAMPAIGN_MESSAGE_ID_NAMESPACE,
  CAMPAIGN_STATS_REFRESH_DELAY_MS,
  CAMPAIGN_STATUS,
  MATERIALIZE_CAMPAIGN_JOB,
  MAX_CAMPAIGN_RECIPIENTS,
  REFRESH_CAMPAIGN_STATS_JOB,
  SEND_CAMPAIGN_EMAIL_JOB,
} from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { type EmailingDomainSendEmailResult } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-result.type';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { type CampaignRecipient } from 'src/engine/core-modules/emailing-domain/types/campaign-recipient.type';
import { type CampaignSkippedBreakdown } from 'src/engine/core-modules/emailing-domain/types/campaign-skipped-breakdown.type';
import { type MaterializeCampaignJobData } from 'src/engine/core-modules/emailing-domain/types/materialize-campaign-job-data.type';
import { type RawCampaignRecipient } from 'src/engine/core-modules/emailing-domain/types/raw-campaign-recipient.type';
import { type RefreshCampaignStatsJobData } from 'src/engine/core-modules/emailing-domain/types/refresh-campaign-stats-job-data.type';
import { type SendCampaignEmailJobData } from 'src/engine/core-modules/emailing-domain/types/send-campaign-email-job-data.type';
import { normalizeCampaignRecipients } from 'src/engine/core-modules/emailing-domain/utils/normalize-campaign-recipients.util';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MessageChannelMetadataService } from 'src/engine/metadata-modules/message-channel/message-channel-metadata.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { EmailBillingService } from 'src/modules/emailing/services/email-billing.service';
import { EmailingDomainSenderService } from 'src/modules/emailing/services/emailing-domain-sender.service';
import { MessageCampaignStatisticsService } from 'src/modules/emailing/services/message-campaign-statistics.service';
import { MessageSuppressionService } from 'src/modules/emailing/services/message-suppression.service';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';
import { MessageListMemberWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-list-member.workspace-entity';
import { renderCampaignTemplate } from 'src/modules/emailing/utils/render-campaign-template.util';
import { sendableDraftCampaignSchema } from 'src/modules/emailing/zod-schemas/sendable-draft-campaign.zod-schema';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { createHtmlToTextConverter } from 'src/modules/messaging/message-import-manager/utils/create-html-to-text-converter.util';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { MessageParticipantRole } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { getDomainFromEmail } from 'src/utils/get-domain-from-email';

type SendCampaignArgs = {
  workspaceId: string;
  userWorkspaceId: string;
  campaignId: string;
};

type SendCampaignTestArgs = {
  workspaceId: string;
  toAddress: string;
  subject: string;
  html: string;
  fromAddress: string;
  unsubscribeTopicId?: string;
};

type SendCampaignResult = {
  campaignId: string;
  queuedCount: number;
  skipped: CampaignSkippedBreakdown;
};

type CampaignAudiencePreview = {
  totalMembers: number;
  withoutEmail: number;
  duplicateEmails: number;
  globallyUnsubscribed: number;
  topicUnsubscribed: number;
  sendable: number;
};

type CampaignMessageRecipient = CampaignRecipient & { messageId: string };

type SendableDraftCampaign = z.infer<typeof sendableDraftCampaignSchema>;

const toRawRecipient = (person: {
  id: string;
  emails?: { primaryEmail?: string | null } | null;
}): RawCampaignRecipient => ({
  personId: person.id,
  email: person.emails?.primaryEmail ?? null,
});

@Injectable()
export class MessageCampaignService {
  private readonly logger = new Logger(MessageCampaignService.name);
  private readonly htmlToText = createHtmlToTextConverter();

  constructor(
    @InjectWorkspaceScopedRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: WorkspaceScopedRepository<EmailingDomainEntity>,
    private readonly emailingDomainSenderService: EmailingDomainSenderService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectMessageQueue(MessageQueue.emailQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly messageChannelMetadataService: MessageChannelMetadataService,
    private readonly messageSuppressionService: MessageSuppressionService,
    private readonly userRoleService: UserRoleService,
    private readonly messageCampaignStatisticsService: MessageCampaignStatisticsService,
    private readonly emailBillingService: EmailBillingService,
    @InjectCacheStorage(CacheStorageNamespace.ModuleEmailing)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  private getUserRepository<T extends ObjectLiteral>(
    workspaceId: string,
    entity: Type<T>,
    roleId: string,
  ) {
    return this.globalWorkspaceOrmManager.getRepository(workspaceId, entity, {
      unionOf: [roleId],
    });
  }

  private getSystemRepository<T extends ObjectLiteral>(
    workspaceId: string,
    entity: Type<T>,
  ) {
    return this.globalWorkspaceOrmManager.getRepository(workspaceId, entity, {
      shouldBypassPermissionChecks: true,
    });
  }

  async send({
    workspaceId,
    userWorkspaceId,
    campaignId,
  }: SendCampaignArgs): Promise<SendCampaignResult> {
    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      workspaceId,
      userWorkspaceId,
    });

    const { fromAddress, listId } =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const sendableCampaign = await this.findSendableDraftCampaignOrThrow(
            workspaceId,
            campaignId,
            roleId,
          );

          return {
            fromAddress: sendableCampaign.fromAddress.primaryEmail,
            listId: sendableCampaign.listId,
          };
        },
      );

    const emailingDomain = await this.findVerifiedEmailingDomainOrThrow(
      workspaceId,
      fromAddress,
    );

    const { recipients, skipped } =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const rawRecipients = await this.resolveRecipientsFromList(
            workspaceId,
            listId,
            roleId,
          );

          const normalized = normalizeCampaignRecipients(
            rawRecipients,
            MAX_CAMPAIGN_RECIPIENTS,
          );

          const campaignRepository = await this.getUserRepository(
            workspaceId,
            MessageCampaignWorkspaceEntity,
            roleId,
          );

          await campaignRepository.update(campaignId, {
            status: CAMPAIGN_STATUS.SENDING,
          });

          return {
            recipients: normalized.recipients,
            skipped: normalized.skipped,
          };
        },
      );

    const messageChannel =
      await this.messageChannelMetadataService.getOrCreateEmailGroupChannel({
        fromAddress,
        userWorkspaceId,
        workspaceId,
      });

    await this.messageQueueService.add<MaterializeCampaignJobData>(
      MATERIALIZE_CAMPAIGN_JOB,
      {
        workspaceId,
        campaignId,
        messageChannelId: messageChannel.id,
        emailingDomainId: emailingDomain.id,
        recipients,
      },
      { retryLimit: 3 },
    );

    return { campaignId, queuedCount: recipients.length, skipped };
  }

  async sendTest({
    workspaceId,
    toAddress,
    subject,
    html,
    fromAddress,
    unsubscribeTopicId,
  }: SendCampaignTestArgs): Promise<EmailingDomainSendEmailResult> {
    const emailingDomain = await this.findVerifiedEmailingDomainOrThrow(
      workspaceId,
      fromAddress,
    );

    const variables = this.buildTemplateVariables(null);
    const renderedSubject = renderCampaignTemplate(subject, variables, {
      escapeValues: false,
    });
    const renderedHtml = renderCampaignTemplate(html, variables, {
      escapeValues: true,
    });

    return this.emailingDomainSenderService.sendEmail(
      workspaceId,
      emailingDomain.id,
      {
        from: fromAddress,
        to: [toAddress],
        subject: renderedSubject,
        text: this.htmlToText(renderedHtml),
        html: renderedHtml,
        unsubscribeTopicId,
      },
    );
  }

  private async findVerifiedEmailingDomainOrThrow(
    workspaceId: string,
    fromAddress: string,
  ): Promise<EmailingDomainEntity> {
    const fromDomain = getDomainFromEmail(fromAddress)?.toLowerCase();

    const emailingDomain = await this.emailingDomainRepository.findOne(
      workspaceId,
      { where: { domain: fromDomain, status: EmailingDomainStatus.VERIFIED } },
    );

    if (!isDefined(emailingDomain)) {
      throw new EmailingDomainException(
        `No verified emailing domain matches the from address ${fromAddress}`,
        EmailingDomainExceptionCode.EMAILING_DOMAIN_NOT_VERIFIED,
      );
    }

    return emailingDomain;
  }

  async processMaterializeJob(data: MaterializeCampaignJobData): Promise<void> {
    const {
      workspaceId,
      campaignId,
      messageChannelId,
      emailingDomainId,
      recipients,
    } = data;

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const campaignRepository = await this.getSystemRepository(
        workspaceId,
        MessageCampaignWorkspaceEntity,
      );

      const campaign = await campaignRepository.findOne({
        where: { id: campaignId },
      });

      if (!isDefined(campaign)) {
        return;
      }

      const recipientsByMessageId = new Map<string, CampaignMessageRecipient>();

      for (const recipient of recipients) {
        const messageId = this.campaignMessageId(
          campaignId,
          recipient.personId,
        );

        if (!recipientsByMessageId.has(messageId)) {
          recipientsByMessageId.set(messageId, { ...recipient, messageId });
        }
      }

      const allRecipients = [...recipientsByMessageId.values()];

      const messageRepository = await this.getSystemRepository(
        workspaceId,
        MessageWorkspaceEntity,
      );

      const existingMessages = await messageRepository.find({
        where: { messageCampaignId: campaignId },
        select: { id: true },
      });
      const existingMessageIds = new Set(
        existingMessages.map((message) => message.id),
      );

      const recipientsToCreate = allRecipients.filter(
        (recipient) => !existingMessageIds.has(recipient.messageId),
      );

      if (recipientsToCreate.length > 0) {
        await this.materializeCampaignMessages({
          workspaceId,
          campaignId,
          messageChannelId,
          fromAddress: campaign.fromAddress?.primaryEmail ?? '',
          subjectTemplate: campaign.subject ?? '',
          bodyTemplate: campaign.bodyTemplate ?? '',
          recipients: recipientsToCreate,
        });
      }

      for (const recipient of allRecipients) {
        await this.messageQueueService.add<SendCampaignEmailJobData>(
          SEND_CAMPAIGN_EMAIL_JOB,
          {
            workspaceId,
            campaignId,
            messageId: recipient.messageId,
            personId: recipient.personId,
            recipientEmail: recipient.email,
            emailingDomainId,
          },
          { retryLimit: 3 },
        );
      }

      await this.finalizeCampaignIfComplete(workspaceId, campaignId);
    }, buildSystemAuthContext(workspaceId));
  }

  async processSendJob(data: SendCampaignEmailJobData): Promise<void> {
    const {
      workspaceId,
      campaignId,
      messageId,
      personId,
      recipientEmail,
      emailingDomainId,
    } = data;

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageRepository = await this.getSystemRepository(
        workspaceId,
        MessageWorkspaceEntity,
      );

      const message = await messageRepository.findOne({
        where: { id: messageId },
      });

      if (
        !isDefined(message) ||
        (message.deliveryStatus !== CAMPAIGN_MESSAGE_DELIVERY_STATUS.QUEUED &&
          message.deliveryStatus !== CAMPAIGN_MESSAGE_DELIVERY_STATUS.FAILED)
      ) {
        return;
      }

      const campaignRepository = await this.getSystemRepository(
        workspaceId,
        MessageCampaignWorkspaceEntity,
      );

      const campaign = await campaignRepository.findOne({
        where: { id: campaignId },
      });

      if (!isDefined(campaign)) {
        return;
      }

      const personRepository = await this.getSystemRepository(
        workspaceId,
        PersonWorkspaceEntity,
      );

      const person = await personRepository.findOne({
        where: { id: personId },
      });

      const variables = this.buildTemplateVariables(person);
      const subject = renderCampaignTemplate(
        campaign.subject ?? '',
        variables,
        {
          escapeValues: false,
        },
      );
      const html = renderCampaignTemplate(
        campaign.bodyTemplate ?? '',
        variables,
        {
          escapeValues: true,
        },
      );
      const text = this.htmlToText(html);
      const fromAddress = campaign.fromAddress?.primaryEmail ?? '';
      const unsubscribeTopicId = campaign.unsubscribeTopicId ?? undefined;

      const hasEmailCredits =
        await this.emailBillingService.hasEmailCredits(workspaceId);

      if (!hasEmailCredits) {
        await messageRepository.update(messageId, {
          deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SKIPPED,
        });

        return;
      }

      try {
        let result: EmailingDomainSendEmailResult;

        try {
          result = await this.emailingDomainSenderService.sendEmail(
            workspaceId,
            emailingDomainId,
            {
              from: fromAddress,
              to: [recipientEmail],
              subject,
              text,
              html,
              unsubscribeTopicId,
            },
          );
        } catch (error) {
          const code =
            error instanceof EmailingDomainDriverException ? error.code : null;

          if (
            code === EmailingDomainDriverExceptionCode.ALL_RECIPIENTS_SUPPRESSED
          ) {
            await messageRepository.update(messageId, {
              deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SKIPPED,
            });

            return;
          }

          await messageRepository.update(messageId, {
            deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.FAILED,
          });
          this.logger.warn(
            `Campaign ${campaignId} send failed for ${recipientEmail}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );

          const isRetryable =
            !isDefined(code) ||
            code === EmailingDomainDriverExceptionCode.TEMPORARY_ERROR ||
            code === EmailingDomainDriverExceptionCode.UNKNOWN;

          if (isRetryable) {
            throw error;
          }

          return;
        }

        await messageRepository.update(messageId, {
          deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENT,
          headerMessageId: result.messageId,
          subject,
          text,
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
      } finally {
        await this.finalizeCampaignIfComplete(workspaceId, campaignId);
      }
    }, buildSystemAuthContext(workspaceId));
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

      if (
        message.deliveryStatus === CAMPAIGN_MESSAGE_DELIVERY_STATUS.BOUNCED ||
        message.deliveryStatus === CAMPAIGN_MESSAGE_DELIVERY_STATUS.COMPLAINED
      ) {
        return;
      }

      await messageRepository.update(message.id, { deliveryStatus });

      await this.scheduleCampaignStatsRefresh({
        workspaceId,
        campaignId: message.messageCampaignId,
      });
    }, buildSystemAuthContext(workspaceId));
  }

  private async findSendableDraftCampaignOrThrow(
    workspaceId: string,
    campaignId: string,
    roleId: string,
  ): Promise<SendableDraftCampaign> {
    const campaignRepository = await this.getUserRepository(
      workspaceId,
      MessageCampaignWorkspaceEntity,
      roleId,
    );

    const campaign = await campaignRepository.findOne({
      where: { id: campaignId },
    });

    if (!isDefined(campaign)) {
      throw new EmailingDomainException(
        `Campaign ${campaignId} not found`,
        EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_FOUND,
      );
    }

    const sendableCampaign = sendableDraftCampaignSchema.safeParse(campaign);

    if (!sendableCampaign.success) {
      throw new EmailingDomainException(
        `Campaign ${campaignId} is not sendable: ${sendableCampaign.error.issues
          .map((issue) => `${issue.path.join('.')} ${issue.message}`)
          .join(', ')}`,
        EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE,
      );
    }

    return sendableCampaign.data;
  }

  private async materializeCampaignMessages({
    workspaceId,
    campaignId,
    messageChannelId,
    fromAddress,
    subjectTemplate,
    bodyTemplate,
    recipients,
  }: {
    workspaceId: string;
    campaignId: string;
    messageChannelId: string;
    fromAddress: string;
    subjectTemplate: string;
    bodyTemplate: string;
    recipients: CampaignMessageRecipient[];
  }): Promise<void> {
    const now = new Date();
    const text = this.htmlToText(bodyTemplate);
    const rows = recipients.map((recipient) => ({
      recipient,
      messageId: recipient.messageId,
      threadId: v4(),
      temporaryExternalId: v4(),
    }));

    const messageThreadRepository = await this.getSystemRepository(
      workspaceId,
      MessageThreadWorkspaceEntity,
    );
    const messageRepository = await this.getSystemRepository(
      workspaceId,
      MessageWorkspaceEntity,
    );
    const associationRepository = await this.getSystemRepository(
      workspaceId,
      MessageChannelMessageAssociationWorkspaceEntity,
    );
    const participantRepository = await this.getSystemRepository(
      workspaceId,
      MessageParticipantWorkspaceEntity,
    );

    const workspaceDataSource =
      await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

    if (!workspaceDataSource) {
      throw new Error(
        `No workspace datasource available for workspace ${workspaceId}`,
      );
    }

    await workspaceDataSource.transaction(
      async (transactionManager: WorkspaceEntityManager) => {
        await messageThreadRepository.insert(
          rows.map((row) => ({ id: row.threadId })),
          transactionManager,
        );
        await messageRepository.insert(
          rows.map((row) => ({
            id: row.messageId,
            headerMessageId: row.temporaryExternalId,
            subject: subjectTemplate,
            text,
            receivedAt: now,
            messageThreadId: row.threadId,
            messageCampaignId: campaignId,
            deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.QUEUED,
          })),
          transactionManager,
        );
        await associationRepository.insert(
          rows.map((row) => ({
            id: v4(),
            messageId: row.messageId,
            messageChannelId,
            messageExternalId: row.temporaryExternalId,
            messageThreadExternalId: row.temporaryExternalId,
            direction: MessageDirection.OUTGOING,
          })),
          transactionManager,
        );
        await participantRepository.insert(
          rows.flatMap((row) => [
            {
              id: v4(),
              messageId: row.messageId,
              role: MessageParticipantRole.FROM,
              handle: fromAddress,
              displayName: fromAddress,
            },
            {
              id: v4(),
              messageId: row.messageId,
              role: MessageParticipantRole.TO,
              handle: row.recipient.email,
              displayName: row.recipient.email,
              personId: row.recipient.personId,
              messageCampaignId: campaignId,
            },
          ]),
          transactionManager,
        );
      },
    );
  }

  private async finalizeCampaignIfComplete(
    workspaceId: string,
    campaignId: string,
  ): Promise<void> {
    const messageRepository = await this.getSystemRepository(
      workspaceId,
      MessageWorkspaceEntity,
    );

    const queuedCount = await messageRepository.count({
      where: {
        messageCampaignId: campaignId,
        deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.QUEUED,
      },
    });

    if (queuedCount > 0) {
      return;
    }

    const failedCount = await messageRepository.count({
      where: {
        messageCampaignId: campaignId,
        deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.FAILED,
      },
    });

    const campaignRepository = await this.getSystemRepository(
      workspaceId,
      MessageCampaignWorkspaceEntity,
    );

    await campaignRepository.update(
      { id: campaignId, status: CAMPAIGN_STATUS.SENDING },
      {
        status:
          failedCount > 0
            ? CAMPAIGN_STATUS.SENT_WITH_ERRORS
            : CAMPAIGN_STATUS.SENT,
        sentAt: new Date(),
      },
    );

    await this.scheduleCampaignStatsRefresh({
      workspaceId,
      campaignId,
    });
  }

  private async scheduleCampaignStatsRefresh({
    workspaceId,
    campaignId,
  }: {
    workspaceId: string;
    campaignId: string;
  }): Promise<void> {
    const acquired = await this.cacheStorageService.acquireLock(
      `campaign-stats-refresh:${workspaceId}:${campaignId}`,
      CAMPAIGN_STATS_REFRESH_DELAY_MS,
    );

    if (!acquired) {
      return;
    }

    await this.messageQueueService.add<RefreshCampaignStatsJobData>(
      REFRESH_CAMPAIGN_STATS_JOB,
      { workspaceId, campaignId },
      { delay: CAMPAIGN_STATS_REFRESH_DELAY_MS },
    );
  }

  async previewAudience({
    workspaceId,
    userWorkspaceId,
    listId,
    unsubscribeTopicId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    listId: string;
    unsubscribeTopicId?: string;
  }): Promise<CampaignAudiencePreview> {
    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      workspaceId,
      userWorkspaceId,
    });

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const rawRecipients = await this.resolveRecipientsFromList(
          workspaceId,
          listId,
          roleId,
        );
        const totalMembers = rawRecipients.length;

        const { recipients, skipped } = normalizeCampaignRecipients(
          rawRecipients,
          MAX_CAMPAIGN_RECIPIENTS,
        );

        const emails = recipients.map((recipient) => recipient.email);

        const globallySuppressed =
          await this.messageSuppressionService.getSuppressedAddresses(
            workspaceId,
            emails,
          );
        const topicSuppressed = isNonEmptyString(unsubscribeTopicId)
          ? await this.messageSuppressionService.getTopicSuppressedAddresses(
              workspaceId,
              emails,
              unsubscribeTopicId,
            )
          : new Set<string>();

        let globallyUnsubscribed = 0;
        let topicUnsubscribed = 0;
        let sendable = 0;

        for (const recipient of recipients) {
          const normalizedEmail = recipient.email.trim().toLowerCase();

          if (globallySuppressed.has(normalizedEmail)) {
            globallyUnsubscribed += 1;
          } else if (topicSuppressed.has(normalizedEmail)) {
            topicUnsubscribed += 1;
          } else {
            sendable += 1;
          }
        }

        return {
          totalMembers,
          withoutEmail: skipped.noEmail,
          duplicateEmails: skipped.deduped,
          globallyUnsubscribed,
          topicUnsubscribed,
          sendable,
        };
      },
    );
  }

  private async resolveRecipientsFromList(
    workspaceId: string,
    listId: string,
    roleId: string,
  ): Promise<RawCampaignRecipient[]> {
    const listMemberRepository = await this.getUserRepository(
      workspaceId,
      MessageListMemberWorkspaceEntity,
      roleId,
    );

    const members = await listMemberRepository.find({
      where: { listId },
    });

    return this.loadRecipientsByPersonIds(
      workspaceId,
      members.map((member) => member.personId),
      roleId,
    );
  }

  private async loadRecipientsByPersonIds(
    workspaceId: string,
    personIds: string[],
    roleId: string,
  ): Promise<RawCampaignRecipient[]> {
    if (personIds.length === 0) {
      return [];
    }

    const personRepository = await this.getUserRepository(
      workspaceId,
      PersonWorkspaceEntity,
      roleId,
    );

    const people = await personRepository.find({
      where: { id: In(personIds) },
    });

    return people.map(toRawRecipient);
  }

  private buildTemplateVariables(
    person: PersonWorkspaceEntity | null,
  ): Record<string, string> {
    const firstName = person?.name?.firstName ?? '';
    const lastName = person?.name?.lastName ?? '';

    return {
      firstName,
      lastName,
      fullName: [firstName, lastName].filter(Boolean).join(' '),
      email: person?.emails?.primaryEmail ?? '',
    };
  }

  private campaignMessageId(campaignId: string, personId: string): string {
    return v5(`${campaignId}:${personId}`, CAMPAIGN_MESSAGE_ID_NAMESPACE);
  }
}
