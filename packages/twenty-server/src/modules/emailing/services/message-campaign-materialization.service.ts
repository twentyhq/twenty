import { Injectable } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { v4 } from 'uuid';

import {
  CAMPAIGN_MATERIALIZATION_CHUNK_SIZE,
  CAMPAIGN_MESSAGE_DELIVERY_STATUS,
  SEND_CAMPAIGN_EMAIL_JOB,
} from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { type MaterializeCampaignJobData } from 'src/engine/core-modules/emailing-domain/types/materialize-campaign-job-data.type';
import { type SendCampaignEmailJobData } from 'src/engine/core-modules/emailing-domain/types/send-campaign-email-job-data.type';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageCampaignLifecycleService } from 'src/modules/emailing/services/message-campaign-lifecycle.service';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';
import { type CampaignMessageRecipient } from 'src/modules/emailing/types/campaign-message-recipient.type';
import { type CampaignMessageRow } from 'src/modules/emailing/types/campaign-message-row.type';
import { buildCampaignMessageInsertPayloads } from 'src/modules/emailing/utils/build-campaign-message-insert-payloads.util';
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
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly messageCampaignLifecycleService: MessageCampaignLifecycleService,
    @InjectMessageQueue(MessageQueue.emailQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async processMaterializeJob({
    workspaceId,
    campaignId,
    messageChannelId,
    emailingDomainId,
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

      const messageRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          MessageWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );

      const existingMessages = await messageRepository.find({
        where: { messageCampaignId: campaignId },
        select: { id: true, deliveryStatus: true },
      });
      const existingMessageIds = new Set(
        existingMessages.map((message) => message.id),
      );
      const queuedMessageIds = new Set(
        existingMessages
          .filter(
            (message) =>
              message.deliveryStatus ===
              CAMPAIGN_MESSAGE_DELIVERY_STATUS.QUEUED,
          )
          .map((message) => message.id),
      );

      const allRecipients = [...recipientsByMessageId.values()];

      const recipientsStrandedByAnEarlierAttempt = allRecipients.filter(
        (recipient) => queuedMessageIds.has(recipient.messageId),
      );

      await this.enqueueSendJobs({
        workspaceId,
        campaignId,
        emailingDomainId,
        recipients: recipientsStrandedByAnEarlierAttempt,
      });

      const recipientsToCreate = allRecipients.filter(
        (recipient) => !existingMessageIds.has(recipient.messageId),
      );

      await this.materializeAndEnqueue({
        workspaceId,
        campaignId,
        messageChannelId,
        emailingDomainId,
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

  private async materializeAndEnqueue({
    workspaceId,
    campaignId,
    messageChannelId,
    emailingDomainId,
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

    for (const recipientsChunk of chunk(
      recipients,
      CAMPAIGN_MATERIALIZATION_CHUNK_SIZE,
    )) {
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

      await this.enqueueSendJobs({
        workspaceId,
        campaignId,
        emailingDomainId,
        recipients: recipientsChunk,
      });
    }
  }

  private async enqueueSendJobs({
    workspaceId,
    campaignId,
    emailingDomainId,
    recipients,
  }: {
    workspaceId: string;
    campaignId: string;
    emailingDomainId: string;
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
      })),
      { retryLimit: 3 },
    );
  }

  private async insertChunk(payloadArgs: {
    campaignId: string;
    messageChannelId: string;
    fromAddress: string;
    subjectTemplate: string;
    text: string;
    now: Date;
    rows: CampaignMessageRow[];
  }): Promise<void> {
    const { messageThreads, messages, channelAssociations, participants } =
      buildCampaignMessageInsertPayloads(payloadArgs);

    await this.globalWorkspaceOrmManager.runInWorkspaceTransaction(
      async (transactionScope) => {
        await transactionScope
          .getRepository<MessageThreadWorkspaceEntity>('messageThread', {
            shouldBypassPermissionChecks: true,
          })
          .insert(messageThreads);
        await transactionScope
          .getRepository<MessageWorkspaceEntity>('message', {
            shouldBypassPermissionChecks: true,
          })
          .insert(messages);
        await transactionScope
          .getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
            'messageChannelMessageAssociation',
            { shouldBypassPermissionChecks: true },
          )
          .insert(channelAssociations);
        await transactionScope
          .getRepository<MessageParticipantWorkspaceEntity>(
            'messageParticipant',
            { shouldBypassPermissionChecks: true },
          )
          .insert(participants);
      },
    );
  }
}
