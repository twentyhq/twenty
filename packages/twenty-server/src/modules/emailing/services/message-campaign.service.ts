import { Injectable, Logger, type Type } from '@nestjs/common';

import { In, type ObjectLiteral } from 'typeorm';
import { v4, v5 } from 'uuid';

import {
  CAMPAIGN_MESSAGE_DELIVERY_STATUS,
  CAMPAIGN_MESSAGE_ID_NAMESPACE,
  CAMPAIGN_STATUS,
  MATERIALIZE_CAMPAIGN_JOB,
  MAX_CAMPAIGN_RECIPIENTS,
  SEND_CAMPAIGN_EMAIL_JOB,
} from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { type EmailingDomainSendEmailResult } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-result.type';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { type CampaignRecipient } from 'src/engine/core-modules/emailing-domain/types/campaign-recipient.type';
import { type CampaignSkippedBreakdown } from 'src/engine/core-modules/emailing-domain/types/campaign-skipped-breakdown.type';
import { type MaterializeCampaignJobData } from 'src/engine/core-modules/emailing-domain/types/materialize-campaign-job-data.type';
import { type RawCampaignRecipient } from 'src/engine/core-modules/emailing-domain/types/raw-campaign-recipient.type';
import { type SendCampaignEmailJobData } from 'src/engine/core-modules/emailing-domain/types/send-campaign-email-job-data.type';
import { normalizeCampaignRecipients } from 'src/engine/core-modules/emailing-domain/utils/normalize-campaign-recipients.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MessageChannelMetadataService } from 'src/engine/metadata-modules/message-channel/message-channel-metadata.service';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { EmailingDomainSenderService } from 'src/modules/emailing/services/emailing-domain-sender.service';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';
import { MessageListMemberWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-list-member.workspace-entity';
import { renderCampaignTemplate } from 'src/modules/emailing/utils/render-campaign-template.util';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { createHtmlToTextConverter } from 'src/modules/messaging/message-import-manager/utils/create-html-to-text-converter.util';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { MessageParticipantRole } from 'twenty-shared/types';
import { getDomainFromEmail } from 'src/utils/get-domain-from-email';

type SendCampaignArgs = {
  workspaceId: string;
  userWorkspaceId: string;
  // The list's hand-picked members are the recipients (the audience).
  listId: string;
  subject: string;
  html: string;
  fromAddress: string;
  // Optional topic for unsubscribe grouping (per-topic suppression + link).
  messageTopicId?: string;
};

type SendCampaignResult = {
  campaignId: string;
  queuedCount: number;
  skipped: CampaignSkippedBreakdown;
};

// A recipient paired with the deterministic message id materialized for it.
type CampaignMessageRecipient = CampaignRecipient & { messageId: string };

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
  ) {}

  // Repository bound to the request's acting user: the user-triggered send path
  // reads the audience and creates the campaign under that user's permissions.
  private getUserRepository<T extends ObjectLiteral>(
    workspaceId: string,
    entity: Type<T>,
  ) {
    return this.globalWorkspaceOrmManager.getRepository(workspaceId, entity);
  }

  // Permission-bypassing repository for background jobs and webhook callbacks,
  // which have no acting user and run as a system actor.
  private getSystemRepository<T extends ObjectLiteral>(
    workspaceId: string,
    entity: Type<T>,
  ) {
    return this.globalWorkspaceOrmManager.getRepository(workspaceId, entity, {
      shouldBypassPermissionChecks: true,
    });
  }

  // Resolves the audience under the caller's permissions, creates the campaign
  // row, and enqueues a single fan-out job carrying only recipient refs. The
  // request never materializes per-recipient messages nor enqueues per-recipient
  // jobs, so it stays fast regardless of audience size.
  async send({
    workspaceId,
    userWorkspaceId,
    messageTopicId,
    subject,
    html,
    fromAddress,
    listId,
  }: SendCampaignArgs): Promise<SendCampaignResult> {
    const fromDomain = getDomainFromEmail(fromAddress)?.toLowerCase();

    const emailingDomain = await this.emailingDomainRepository.findOne(
      workspaceId,
      { where: { domain: fromDomain, status: EmailingDomainStatus.VERIFIED } },
    );

    if (emailingDomain === null) {
      throw new Error(
        `No verified emailing domain matches the from address ${fromAddress}`,
      );
    }

    const messageChannel =
      await this.messageChannelMetadataService.getOrCreateEmailGroupChannel({
        fromAddress,
        userWorkspaceId,
        workspaceId,
      });

    // No explicit auth context: the audience read and campaign creation run
    // under the request's acting user, so they respect that user's permissions.
    const { campaignId, recipients, skipped } =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const rawRecipients = await this.resolveRecipientsFromList(
            workspaceId,
            listId,
          );

          const normalized = normalizeCampaignRecipients(
            rawRecipients,
            MAX_CAMPAIGN_RECIPIENTS,
          );

          const newCampaignId = await this.createCampaign({
            workspaceId,
            subject,
            html,
            fromAddress,
            messageTopicId,
            listId,
          });

          return {
            campaignId: newCampaignId,
            recipients: normalized.recipients,
            skipped: normalized.skipped,
          };
        },
      );

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

  // Fan-out: materializes one QUEUED message per recipient that doesn't have one
  // yet (deterministic id => safe to re-run), then enqueues a per-recipient send
  // job for every QUEUED message. Re-running reconciles messages orphaned by a
  // crash mid-fan-out. Runs as a system actor (no acting user in a job).
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

      if (campaign === null) {
        return;
      }

      // Dedupe by the deterministic message id so a person listed twice yields a
      // single message (and a single send job).
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

      // Finalizes the campaign immediately when nothing was queued
      // (zero-recipient case); otherwise the last send job finalizes it.
      await this.finalizeCampaignIfComplete(workspaceId, campaignId);
    }, buildSystemAuthContext(workspaceId));
  }

  // Processes one recipient's send job: idempotent, renders the campaign
  // template against the recipient, sends via the emailing-domain sender (keeps
  // suppression + unsubscribe + reply-to), records per-message status, and
  // finalizes the campaign once nothing remains queued. Send errors are rethrown
  // so the queue retries the job; a successful retry flips FAILED back to SENT.
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

      // QUEUED is a first attempt, FAILED a previous attempt of this same job
      // being retried by the queue. Everything else (SENT, BOUNCED, COMPLAINED,
      // SKIPPED) is terminal: never send twice.
      if (
        message === null ||
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

      if (campaign === null) {
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
      const messageTopicId = campaign.topicId ?? undefined;

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
              messageTopicId,
            },
          );
        } catch (error) {
          const code =
            error instanceof EmailingDomainDriverException ? error.code : null;

          // The recipient is suppressed (bounced/complained/unsubscribed): an
          // intended skip, not a delivery failure, and never retryable.
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

          // Only transient failures are worth retrying. Deterministic ones
          // (misconfiguration, suspended sending, unsubscribe domain not ready)
          // fail identically on every attempt, so they stay terminally FAILED
          // instead of burning the retry budget. Rethrowing triggers the retry;
          // the persisted FAILED status makes a successful retry resume safely.
          const isRetryable =
            code === null ||
            code === EmailingDomainDriverExceptionCode.TEMPORARY_ERROR ||
            code === EmailingDomainDriverExceptionCode.UNKNOWN;

          if (isRetryable) {
            throw error;
          }

          return;
        }

        // Adopt the SES id as the message id so a reply (whose In-Reply-To
        // references it) threads back onto this send, and persist the rendered
        // (personalized) subject/body that the recipient actually received.
        await messageRepository.update(messageId, {
          deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENT,
          headerMessageId: result.messageId,
          subject,
          text,
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

  // Correlates an SES bounce/complaint (by the send's message id) to the
  // campaign message and records BOUNCED/COMPLAINED on it. No-op when the id
  // doesn't match a campaign send.
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

      if (message === null || message.messageCampaignId === null) {
        return;
      }

      // BOUNCED/COMPLAINED are terminal; don't let a later event downgrade or
      // flip an already-recorded failure (e.g. a complaint after a bounce).
      if (
        message.deliveryStatus === CAMPAIGN_MESSAGE_DELIVERY_STATUS.BOUNCED ||
        message.deliveryStatus === CAMPAIGN_MESSAGE_DELIVERY_STATUS.COMPLAINED
      ) {
        return;
      }

      await messageRepository.update(message.id, { deliveryStatus });
    }, buildSystemAuthContext(workspaceId));
  }

  // Inserts the campaign row (no messages — the fan-out job materializes those).
  // Must run inside an active workspace context.
  private async createCampaign({
    workspaceId,
    subject,
    html,
    fromAddress,
    messageTopicId,
    listId,
  }: {
    workspaceId: string;
    subject: string;
    html: string;
    fromAddress: string;
    messageTopicId?: string;
    listId: string;
  }): Promise<string> {
    const campaignRepository = await this.getUserRepository(
      workspaceId,
      MessageCampaignWorkspaceEntity,
    );

    const { identifiers } = await campaignRepository.insert({
      subject,
      bodyTemplate: html,
      fromAddress: { primaryEmail: fromAddress, additionalEmails: null },
      status: CAMPAIGN_STATUS.SENDING,
      topicId: messageTopicId ?? null,
      listId,
    });

    return identifiers[0].id;
  }

  // Creates the outbound messages (QUEUED) + threads, channel associations and
  // from/to participants for the given recipients in ONE transaction. Each
  // recipient's personId is set directly (no participant matching, no contact
  // auto-creation). Message ids are deterministic (campaignId, personId), so a
  // retry skips recipients already materialized. Runs as a system actor.
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
    // Placeholder body for the timeline before send; the send job overwrites it
    // with the personalized render.
    const text = this.htmlToText(bodyTemplate);
    const rows = recipients.map((recipient) => ({
      recipient,
      messageId: recipient.messageId,
      threadId: v4(),
      // Temporary id; the send job overwrites it with the SES id so the stored
      // ids match what the recipient receives (reply-threading).
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

  // Finalizes the campaign once nothing remains QUEUED: SENT, or SENT_WITH_ERRORS
  // when at least one recipient terminally FAILED. The status='SENDING' guard
  // makes this a compare-and-swap so concurrent jobs finalize exactly once. Must
  // run inside a workspace context.
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
  }

  // Resolves the recipients of a campaign from a list's hand-picked members.
  private async resolveRecipientsFromList(
    workspaceId: string,
    listId: string,
  ): Promise<RawCampaignRecipient[]> {
    const listMemberRepository = await this.getUserRepository(
      workspaceId,
      MessageListMemberWorkspaceEntity,
    );

    const members = await listMemberRepository.find({
      where: { listId },
    });

    return this.loadRecipientsByPersonIds(
      workspaceId,
      members.map((member) => member.personId),
    );
  }

  private async loadRecipientsByPersonIds(
    workspaceId: string,
    personIds: string[],
  ): Promise<RawCampaignRecipient[]> {
    if (personIds.length === 0) {
      return [];
    }

    const personRepository = await this.getUserRepository(
      workspaceId,
      PersonWorkspaceEntity,
    );

    const people = await personRepository.find({
      where: { id: In(personIds) },
    });

    return people.map(toRawRecipient);
  }

  // Per-recipient merge fields available to {{variable}} tokens in templates.
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
