import { Injectable, Logger, type Type } from '@nestjs/common';

import { In, type ObjectLiteral } from 'typeorm';
import { v4 } from 'uuid';

import {
  CAMPAIGN_MESSAGE_DELIVERY_STATUS,
  CAMPAIGN_STATUS,
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
import { EmailingDomainSenderService } from 'src/modules/emailing/services/emailing-domain-sender.service';
import { type SendCampaignEmailJobData } from 'src/engine/core-modules/emailing-domain/types/send-campaign-email-job-data.type';
import { type CampaignRecipient } from 'src/engine/core-modules/emailing-domain/types/campaign-recipient.type';
import { type CampaignSkippedBreakdown } from 'src/engine/core-modules/emailing-domain/types/campaign-skipped-breakdown.type';
import { type RawCampaignRecipient } from 'src/engine/core-modules/emailing-domain/types/raw-campaign-recipient.type';
import { normalizeCampaignRecipients } from 'src/engine/core-modules/emailing-domain/utils/normalize-campaign-recipients.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MessageChannelMetadataService } from 'src/engine/metadata-modules/message-channel/message-channel-metadata.service';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';
import { MessageListMemberWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-list-member.workspace-entity';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { MessageParticipantRole } from 'twenty-shared/types';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { createHtmlToTextConverter } from 'src/modules/messaging/message-import-manager/utils/create-html-to-text-converter.util';
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

  // Workspace-data repository for a workspace entity. The user-triggered send
  // path runs under the caller's permissions (shouldBypassPermissionChecks
  // false); background jobs and webhook callbacks have no acting user and run
  // as a system actor (true).
  private getWorkspaceRepository<T extends ObjectLiteral>(
    workspaceId: string,
    entity: Type<T>,
    shouldBypassPermissionChecks: boolean,
  ) {
    return this.globalWorkspaceOrmManager.getRepository(workspaceId, entity, {
      shouldBypassPermissionChecks,
    });
  }

  // Orchestrates a campaign send: resolves the verified domain + email-group
  // channel, materializes one QUEUED message per recipient, and enqueues a send
  // job each. Sending happens asynchronously in the job, not in this request.
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

    const text = this.htmlToText(html);

    // No explicit auth context: the send runs under the request's acting user,
    // so reading the audience and materializing the campaign respect that
    // user's permissions.
    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const rawRecipients = await this.resolveRecipientsFromList(
          workspaceId,
          listId,
        );

        const { recipients, skipped } = normalizeCampaignRecipients(
          rawRecipients,
          MAX_CAMPAIGN_RECIPIENTS,
        );

        const { campaignId, messageIds } =
          await this.createCampaignWithMessages({
            workspaceId,
            messageChannelId: messageChannel.id,
            fromAddress,
            recipients,
            subject,
            html,
            text,
            messageTopicId,
            listId,
          });

        for (let index = 0; index < recipients.length; index += 1) {
          await this.messageQueueService.add<SendCampaignEmailJobData>(
            SEND_CAMPAIGN_EMAIL_JOB,
            {
              workspaceId,
              campaignId,
              messageId: messageIds[index],
              recipientEmail: recipients[index].email,
              emailingDomainId: emailingDomain.id,
              messageTopicId,
              fromAddress,
              subject,
              html,
            },
            { retryLimit: 3 },
          );
        }

        // Marks the campaign SENT immediately when nothing was queued
        // (zero-recipient case); otherwise the last send job finalizes it.
        await this.finalizeCampaignIfComplete(workspaceId, campaignId, false);

        return { campaignId, queuedCount: recipients.length, skipped };
      },
    );
  }

  // Processes one recipient's send job: idempotent, sends via the emailing-domain
  // sender (keeps suppression + unsubscribe + reply-to), records per-message
  // status, and finalizes the campaign once nothing remains queued. Send errors
  // are rethrown so the queue retries the job; a successful retry flips the
  // message back from FAILED to SENT.
  async processSendJob(data: SendCampaignEmailJobData): Promise<void> {
    const {
      workspaceId,
      campaignId,
      messageId,
      recipientEmail,
      emailingDomainId,
      messageTopicId,
      fromAddress,
      subject,
      html,
    } = data;

    const text = this.htmlToText(html);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageRepository = await this.getWorkspaceRepository(
        workspaceId,
        MessageWorkspaceEntity,
        true,
      );

      const message = await messageRepository.findOne({
        where: { id: messageId },
      });

      // QUEUED is a first attempt, FAILED a previous attempt of this same job
      // being retried by the queue. Everything else (SENT, BOUNCED, COMPLAINED)
      // is terminal: never send twice.
      if (
        message === null ||
        (message.deliveryStatus !== CAMPAIGN_MESSAGE_DELIVERY_STATUS.QUEUED &&
          message.deliveryStatus !== CAMPAIGN_MESSAGE_DELIVERY_STATUS.FAILED)
      ) {
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
        // references it) threads back onto this send, mirroring the existing
        // email-group outbound model. A bookkeeping failure past this point
        // still fails the job, but the SENT status makes the retry a no-op.
        await messageRepository.update(messageId, {
          deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENT,
          headerMessageId: result.messageId,
        });

        const associationRepository = await this.getWorkspaceRepository(
          workspaceId,
          MessageChannelMessageAssociationWorkspaceEntity,
          true,
        );

        await associationRepository.update(
          { messageId },
          {
            messageExternalId: result.messageId,
            messageThreadExternalId: result.messageId,
          },
        );
      } finally {
        await this.finalizeCampaignIfComplete(workspaceId, campaignId, true);
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
      const messageRepository = await this.getWorkspaceRepository(
        workspaceId,
        MessageWorkspaceEntity,
        true,
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

  // Creates the campaign row and its outbound messages (QUEUED) + threads,
  // channel associations and from/to participants in ONE transaction, so a
  // failure can never leave an orphan SENDING campaign with no messages. Each
  // recipient's personId is set directly (no participant matching, no contact
  // auto-creation). Returns the campaign id and the message ids aligned with
  // the recipients order. Must run inside an active workspace context.
  private async createCampaignWithMessages({
    workspaceId,
    messageChannelId,
    fromAddress,
    recipients,
    subject,
    html,
    text,
    messageTopicId,
    listId,
  }: {
    workspaceId: string;
    messageChannelId: string;
    fromAddress: string;
    recipients: CampaignRecipient[];
    subject: string;
    html: string;
    text: string;
    messageTopicId?: string;
    listId: string;
  }): Promise<{ campaignId: string; messageIds: string[] }> {
    const now = new Date();
    const rows = recipients.map((recipient) => ({
      recipient,
      threadId: v4(),
      messageId: v4(),
      // Temporary id; the send job overwrites it with the SES id so the stored
      // ids match what the recipient receives (reply-threading).
      temporaryExternalId: v4(),
    }));

    const campaignRepository = await this.getWorkspaceRepository(
      workspaceId,
      MessageCampaignWorkspaceEntity,
      false,
    );
    const messageThreadRepository = await this.getWorkspaceRepository(
      workspaceId,
      MessageThreadWorkspaceEntity,
      false,
    );
    const messageRepository = await this.getWorkspaceRepository(
      workspaceId,
      MessageWorkspaceEntity,
      false,
    );
    const associationRepository = await this.getWorkspaceRepository(
      workspaceId,
      MessageChannelMessageAssociationWorkspaceEntity,
      false,
    );
    const participantRepository = await this.getWorkspaceRepository(
      workspaceId,
      MessageParticipantWorkspaceEntity,
      false,
    );

    const workspaceDataSource =
      await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

    if (!workspaceDataSource) {
      throw new Error(
        `No workspace datasource available for workspace ${workspaceId}`,
      );
    }

    let campaignId = '';

    await workspaceDataSource.transaction(
      async (transactionManager: WorkspaceEntityManager) => {
        const { identifiers } = await campaignRepository.insert(
          {
            subject,
            bodyTemplate: html,
            fromAddress: { primaryEmail: fromAddress, additionalEmails: null },
            status: CAMPAIGN_STATUS.SENDING,
            topicId: messageTopicId ?? null,
            listId,
          },
          transactionManager,
        );

        campaignId = identifiers[0].id;

        if (rows.length === 0) {
          return;
        }

        await messageThreadRepository.insert(
          rows.map((row) => ({ id: row.threadId })),
          transactionManager,
        );
        await messageRepository.insert(
          rows.map((row) => ({
            id: row.messageId,
            headerMessageId: row.temporaryExternalId,
            subject,
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

    return { campaignId, messageIds: rows.map((row) => row.messageId) };
  }

  // Finalizes the campaign once nothing remains QUEUED. The status='SENDING'
  // guard makes this a compare-and-swap so concurrent jobs finalize exactly
  // once. Must run inside a workspace context.
  private async finalizeCampaignIfComplete(
    workspaceId: string,
    campaignId: string,
    shouldBypassPermissionChecks: boolean,
  ): Promise<void> {
    const messageRepository = await this.getWorkspaceRepository(
      workspaceId,
      MessageWorkspaceEntity,
      shouldBypassPermissionChecks,
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

    const campaignRepository = await this.getWorkspaceRepository(
      workspaceId,
      MessageCampaignWorkspaceEntity,
      shouldBypassPermissionChecks,
    );

    await campaignRepository.update(
      { id: campaignId, status: CAMPAIGN_STATUS.SENDING },
      {
        status: CAMPAIGN_STATUS.SENT,
        sentAt: new Date(),
      },
    );
  }

  // Resolves the recipients of a campaign from a list's hand-picked members.
  private async resolveRecipientsFromList(
    workspaceId: string,
    listId: string,
  ): Promise<RawCampaignRecipient[]> {
    const listMemberRepository = await this.getWorkspaceRepository(
      workspaceId,
      MessageListMemberWorkspaceEntity,
      false,
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

    const personRepository = await this.getWorkspaceRepository(
      workspaceId,
      PersonWorkspaceEntity,
      false,
    );

    const people = await personRepository.find({
      where: { id: In(personIds) },
    });

    return people.map(toRawRecipient);
  }
}
