import { CAMPAIGN_SEND_RETRY_LIMIT } from 'src/engine/core-modules/emailing-domain/constants/campaign-send-retry-limit.constant';
import { CAMPAIGN_SEND_RETRY_BACKOFF } from 'src/engine/core-modules/emailing-domain/constants/campaign-send-retry-backoff.constant';
import { CAMPAIGN_MATERIALIZATION_CHUNK_SIZE } from 'src/engine/core-modules/emailing-domain/constants/campaign-materialization-chunk-size.constant';
import { Injectable } from '@nestjs/common';

import { CampaignDeliveryEntity } from 'src/engine/core-modules/emailing-domain/campaign-delivery.entity';
import { CAMPAIGN_DELIVERY_STATE } from 'src/engine/core-modules/emailing-domain/constants/campaign-delivery-state.constant';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

import chunk from 'lodash.chunk';
import { v4 } from 'uuid';

import { SEND_CAMPAIGN_EMAIL_JOB } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { type MaterializeCampaignJobData } from 'src/engine/core-modules/emailing-domain/types/materialize-campaign-job-data.type';
import { type SendCampaignEmailJobData } from 'src/engine/core-modules/emailing-domain/types/send-campaign-email-job-data.type';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageCampaignLifecycleService } from 'src/modules/emailing/services/message-campaign-lifecycle.service';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';
import { type CampaignRecipient } from 'src/engine/core-modules/emailing-domain/types/campaign-recipient.type';
import { type CampaignMessageRecipient } from 'src/modules/emailing/types/campaign-message-recipient.type';
import { type CampaignMessageRow } from 'src/modules/emailing/types/campaign-message-row.type';
import { buildCampaignMessageId } from 'src/modules/emailing/utils/build-campaign-message-id.util';
import { compileCampaignEmailContent } from 'src/modules/emailing/utils/compile-campaign-email-content.util';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import {
  MessageCampaignStatus,
  MessageParticipantRole,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type MaterializeMessagesArgs = {
  workspaceId: string;
  emailingDomainId: string;
  userWorkspaceId: string;
  campaignId: string;
  messageChannelId: string;
  fromAddress: string;
  subjectTemplate: string;
  bodyTemplate: string;
  recipients: CampaignMessageRecipient[];
};

@Injectable()
export class MessageCampaignMaterializationService {
  constructor(
    @InjectWorkspaceScopedRepository(CampaignDeliveryEntity)
    private readonly campaignDeliveryRepository: WorkspaceScopedRepository<CampaignDeliveryEntity>,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly messageCampaignLifecycleService: MessageCampaignLifecycleService,
    @InjectMessageQueue(MessageQueue.campaignQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async processMaterializeJob({
    workspaceId,
    campaignId,
    messageChannelId,
    emailingDomainId,
    userWorkspaceId,
    recipients,
  }: MaterializeCampaignJobData): Promise<void> {
    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
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
        campaign.status !== MessageCampaignStatus.SENDING
      ) {
        return;
      }

      const uniqueRecipients = this.deduplicateRecipientsByMessageId({
        campaignId,
        recipients,
      });

      const existingDeliveries = await this.campaignDeliveryRepository.find(
        workspaceId,
        { where: { campaignId }, select: { id: true, state: true } },
      );
      const existingMessageIds = new Set(
        existingDeliveries.map((delivery) => delivery.id),
      );
      const queuedMessageIds = new Set(
        existingDeliveries
          .filter(
            (delivery) => delivery.state === CAMPAIGN_DELIVERY_STATE.QUEUED,
          )
          .map((delivery) => delivery.id),
      );

      const recipientsStrandedByAnEarlierAttempt = uniqueRecipients.filter(
        (recipient) => queuedMessageIds.has(recipient.messageId),
      );

      await this.enqueueSendJobs({
        workspaceId,
        campaignId,
        emailingDomainId,
        userWorkspaceId,
        recipients: recipientsStrandedByAnEarlierAttempt,
      });

      const recipientsToCreate = uniqueRecipients.filter(
        (recipient) => !existingMessageIds.has(recipient.messageId),
      );

      await this.materializeAndEnqueue({
        workspaceId,
        campaignId,
        messageChannelId,
        emailingDomainId,
        userWorkspaceId,
        fromAddress: campaign.fromAddress?.primaryEmail ?? '',
        subjectTemplate: campaign.subject ?? '',
        bodyTemplate: campaign.bodyTemplate ?? '',
        recipients: recipientsToCreate,
      });

      await this.messageCampaignLifecycleService.finalizeCampaignIfComplete({
        workspaceId,
        campaignId,
      });
    }, buildSystemAuthContext(workspaceId));
  }

  private deduplicateRecipientsByMessageId({
    campaignId,
    recipients,
  }: {
    campaignId: string;
    recipients: CampaignRecipient[];
  }): CampaignMessageRecipient[] {
    const recipientsByMessageId = new Map<string, CampaignMessageRecipient>();

    for (const recipient of recipients) {
      const messageId = buildCampaignMessageId({
        campaignId,
        personId: recipient.personId,
      });

      if (!recipientsByMessageId.has(messageId)) {
        recipientsByMessageId.set(messageId, { ...recipient, messageId });
      }
    }

    return [...recipientsByMessageId.values()];
  }

  private async materializeAndEnqueue({
    workspaceId,
    campaignId,
    messageChannelId,
    emailingDomainId,
    userWorkspaceId,
    fromAddress,
    subjectTemplate,
    bodyTemplate,
    recipients,
  }: MaterializeMessagesArgs): Promise<void> {
    const now = new Date();
    const { plainText: unrenderedText } = await compileCampaignEmailContent(
      bodyTemplate,
      null,
    );

    const recipientChunks = chunk(
      recipients,
      CAMPAIGN_MATERIALIZATION_CHUNK_SIZE,
    );

    for (const recipientsChunk of recipientChunks) {
      await this.insertChunk({
        campaignId,
        messageChannelId,
        fromAddress,
        subjectTemplate,
        text: unrenderedText,
        now,
        rows: recipientsChunk.map((recipient) => ({
          recipient,
          messageId: recipient.messageId,
          threadId: v4(),
          temporaryExternalId: v4(),
        })),
      });

      await this.campaignDeliveryRepository.upsert(
        workspaceId,
        recipientsChunk.map((recipient) => ({
          id: recipient.messageId,
          campaignId,
          messageId: recipient.messageId,
          personId: recipient.personId,
          recipientEmail: recipient.email,
          state: CAMPAIGN_DELIVERY_STATE.QUEUED,
        })),
        { conflictPaths: ['id'], skipUpdateIfNoValuesChanged: true },
      );
    }

    for (const recipientsChunk of recipientChunks) {
      await this.enqueueSendJobs({
        workspaceId,
        campaignId,
        emailingDomainId,
        userWorkspaceId,
        recipients: recipientsChunk,
      });
    }
  }

  private async enqueueSendJobs({
    workspaceId,
    campaignId,
    emailingDomainId,
    userWorkspaceId,
    recipients,
  }: {
    workspaceId: string;
    campaignId: string;
    emailingDomainId: string;
    userWorkspaceId: string;
    recipients: CampaignMessageRecipient[];
  }): Promise<void> {
    if (recipients.length === 0) {
      return;
    }

    await this.messageQueueService.bulkAdd<SendCampaignEmailJobData>(
      SEND_CAMPAIGN_EMAIL_JOB,
      recipients.map((recipient) => ({
        workspaceId,
        campaignId,
        messageId: recipient.messageId,
        personId: recipient.personId,
        recipientEmail: recipient.email,
        emailingDomainId,
        userWorkspaceId,
      })),
      {
        retryLimit: CAMPAIGN_SEND_RETRY_LIMIT,
        backoff: CAMPAIGN_SEND_RETRY_BACKOFF,
      },
    );
  }

  private async insertChunk({
    campaignId,
    messageChannelId,
    fromAddress,
    subjectTemplate,
    text,
    now,
    rows,
  }: {
    campaignId: string;
    messageChannelId: string;
    fromAddress: string;
    subjectTemplate: string;
    text: string;
    now: Date;
    rows: CampaignMessageRow[];
  }): Promise<void> {
    await this.globalWorkspaceOrmManager.runInWorkspaceTransaction(
      async (transactionScope) => {
        await transactionScope
          .getRepository<MessageThreadWorkspaceEntity>('messageThread', {
            shouldBypassPermissionChecks: true,
          })
          .insert(rows.map((row) => ({ id: row.threadId })));

        await transactionScope
          .getRepository<MessageWorkspaceEntity>('message', {
            shouldBypassPermissionChecks: true,
          })
          .insert(
            rows.map((row) => ({
              id: row.messageId,
              headerMessageId: row.temporaryExternalId,
              subject: subjectTemplate,
              text,
              receivedAt: now,
              messageThreadId: row.threadId,
              messageCampaignId: campaignId,
            })),
          );

        await transactionScope
          .getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
            'messageChannelMessageAssociation',
            { shouldBypassPermissionChecks: true },
          )
          .insert(
            rows.map((row) => ({
              id: v4(),
              messageId: row.messageId,
              messageChannelId,
              messageExternalId: row.temporaryExternalId,
              messageThreadExternalId: row.temporaryExternalId,
              direction: MessageDirection.OUTGOING,
            })),
          );

        await transactionScope
          .getRepository<MessageParticipantWorkspaceEntity>(
            'messageParticipant',
            { shouldBypassPermissionChecks: true },
          )
          .insert(
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
          );
      },
    );
  }
}
