import { CAMPAIGN_SEND_RETRY_LIMIT } from 'src/engine/core-modules/emailing-domain/constants/campaign-send-retry-limit.constant';
import { CAMPAIGN_SEND_RETRY_BACKOFF } from 'src/engine/core-modules/emailing-domain/constants/campaign-send-retry-backoff.constant';
import { Injectable, Logger } from '@nestjs/common';

import { CampaignDeliveryEntity } from 'src/engine/core-modules/emailing-domain/campaign-delivery.entity';
import { CAMPAIGN_DELIVERY_STATE } from 'src/engine/core-modules/emailing-domain/constants/campaign-delivery-state.constant';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

import chunk from 'lodash.chunk';
import { In, type ObjectLiteral } from 'typeorm';
import { v4 } from 'uuid';

import { MATERIALIZE_CAMPAIGN_CHUNK_JOB } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { SEND_CAMPAIGN_EMAIL_BATCH_JOB } from 'src/engine/core-modules/emailing-domain/constants/send-campaign-email-batch-job.constant';
import { resolveCampaignSendBatchSize } from 'src/engine/core-modules/emailing-domain/utils/resolve-campaign-send-batch-size.util';
import { type MaterializeCampaignChunkJobData } from 'src/engine/core-modules/emailing-domain/types/materialize-campaign-chunk-job-data.type';
import { type MaterializeCampaignJobData } from 'src/engine/core-modules/emailing-domain/types/materialize-campaign-job-data.type';
import { type SendCampaignEmailBatchJobData } from 'src/engine/core-modules/emailing-domain/types/send-campaign-email-batch-job-data.type';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageCampaignLifecycleService } from 'src/modules/emailing/services/message-campaign-lifecycle.service';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';
import { type CampaignRecipient } from 'src/engine/core-modules/emailing-domain/types/campaign-recipient.type';
import { type CampaignMessageRecipient } from 'src/modules/emailing/types/campaign-message-recipient.type';
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

const MATERIALIZATION_CHUNK_SIZE = 500;

// Campaign rows are machine-generated and nothing subscribes to them: no
// webhook, workflow trigger or timeline activity. Emitting would cost a
// snapshot SELECT of every row written plus a timeline row per recipient.
const SKIP_EVENT_EMISSION = { shouldSkipEventEmission: true };

type CampaignMessageRow = {
  recipient: CampaignMessageRecipient;
  messageId: string;
  threadId: string;
  temporaryExternalId: string;
};

@Injectable()
export class MessageCampaignMaterializationService {
  private readonly logger = new Logger(
    MessageCampaignMaterializationService.name,
  );

  constructor(
    @InjectWorkspaceScopedRepository(CampaignDeliveryEntity)
    private readonly campaignDeliveryRepository: WorkspaceScopedRepository<CampaignDeliveryEntity>,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly messageCampaignLifecycleService: MessageCampaignLifecycleService,
    @InjectMessageQueue(MessageQueue.campaignQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectMessageQueue(MessageQueue.campaignSendQueue)
    private readonly campaignSendQueueService: MessageQueueService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async processMaterializeJob({
    workspaceId,
    campaignId,
    messageChannelId,
    emailingDomainId,
    userWorkspaceId,
    recipients,
  }: MaterializeCampaignJobData): Promise<void> {
    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const campaignRepository = this.workspaceOrmManager.getRepository(
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

      const recipientsToCreate = uniqueRecipients.filter(
        (recipient) => !existingMessageIds.has(recipient.messageId),
      );

      const enqueuedChunkCount = await this.enqueueMaterializationChunks({
        workspaceId,
        campaignId,
        messageChannelId,
        emailingDomainId,
        userWorkspaceId,
        recipientsToCreate,
        recipientsStrandedByAnEarlierAttempt,
      });

      // Only finalize here when there is no chunk left to run. Doing it while
      // chunks are still pending would see zero deliveries and settle the
      // campaign as SENT_WITH_ERRORS before a single message exists.
      if (enqueuedChunkCount === 0) {
        await this.messageCampaignLifecycleService.finalizeCampaignIfComplete({
          workspaceId,
          campaignId,
        });
      }
    }, buildSystemAuthContext(workspaceId));
  }

  private async enqueueMaterializationChunks({
    workspaceId,
    campaignId,
    messageChannelId,
    emailingDomainId,
    userWorkspaceId,
    recipientsToCreate,
    recipientsStrandedByAnEarlierAttempt,
  }: {
    workspaceId: string;
    campaignId: string;
    messageChannelId: string;
    emailingDomainId: string;
    userWorkspaceId: string;
    recipientsToCreate: CampaignMessageRecipient[];
    recipientsStrandedByAnEarlierAttempt: CampaignMessageRecipient[];
  }): Promise<number> {
    const receivedAtIso = new Date().toISOString();

    const chunks: MaterializeCampaignChunkJobData[] = [
      ...chunk(recipientsToCreate, MATERIALIZATION_CHUNK_SIZE).map(
        (recipients) => ({ recipients, shouldCreateMessages: true }),
      ),
      ...chunk(
        recipientsStrandedByAnEarlierAttempt,
        MATERIALIZATION_CHUNK_SIZE,
      ).map((recipients) => ({ recipients, shouldCreateMessages: false })),
    ].map(({ recipients, shouldCreateMessages }) => ({
      workspaceId,
      campaignId,
      messageChannelId,
      emailingDomainId,
      userWorkspaceId,
      receivedAtIso,
      shouldCreateMessages,
      recipients,
    }));

    if (chunks.length === 0) {
      return 0;
    }

    await this.messageQueueService.bulkAdd<MaterializeCampaignChunkJobData>(
      MATERIALIZE_CAMPAIGN_CHUNK_JOB,
      chunks.map((chunk) => ({ data: chunk })),
      { retryLimit: 3, backoff: CAMPAIGN_SEND_RETRY_BACKOFF },
    );

    return chunks.length;
  }

  async processMaterializeChunkJob({
    workspaceId,
    campaignId,
    messageChannelId,
    emailingDomainId,
    userWorkspaceId,
    receivedAtIso,
    shouldCreateMessages,
    recipients,
  }: MaterializeCampaignChunkJobData): Promise<void> {
    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const campaignRepository = this.workspaceOrmManager.getRepository(
        MessageCampaignWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

      const campaign = await campaignRepository.findOne({
        where: { id: campaignId },
      });

      // A cancel between chunks stops the ones that have not run yet.
      if (
        !isDefined(campaign) ||
        campaign.status !== MessageCampaignStatus.SENDING
      ) {
        return;
      }

      if (shouldCreateMessages) {
        const { plainText: unrenderedText } = await compileCampaignEmailContent(
          campaign.bodyTemplate ?? '',
          null,
        );

        await this.insertMessagesBeforeTheirDeliveries({
          workspaceId,
          campaignId,
          messageChannelId,
          fromAddress: campaign.fromAddress?.primaryEmail ?? '',
          subjectTemplate: campaign.subject ?? '',
          text: unrenderedText,
          now: new Date(receivedAtIso),
          recipients: await this.rejectAlreadyMaterializedRecipients({
            campaignId,
            recipients,
          }),
        });
      }

      await this.enqueueSendJobs({
        workspaceId,
        campaignId,
        emailingDomainId,
        userWorkspaceId,
        recipients,
      });

      await this.messageCampaignLifecycleService.finalizeCampaignIfComplete({
        workspaceId,
        campaignId,
      });
    }, buildSystemAuthContext(workspaceId));
  }

  // A retried chunk job must not insert the rows its previous attempt already
  // wrote: message ids are deterministic and would collide, and the thread,
  // association and participant rows would be duplicated under fresh ids.
  private async rejectAlreadyMaterializedRecipients({
    campaignId,
    recipients,
  }: {
    campaignId: string;
    recipients: CampaignMessageRecipient[];
  }): Promise<CampaignMessageRecipient[]> {
    if (recipients.length === 0) {
      return [];
    }

    const messageRepository = this.workspaceOrmManager.getRepository(
      MessageWorkspaceEntity,
      { shouldBypassPermissionChecks: true },
    );

    const alreadyMaterialized = await messageRepository.find({
      where: {
        messageCampaignId: campaignId,
        id: In(recipients.map((recipient) => recipient.messageId)),
      },
      select: { id: true },
    });

    if (alreadyMaterialized.length === 0) {
      return recipients;
    }

    const alreadyMaterializedIds = new Set(
      alreadyMaterialized.map((message) => message.id),
    );

    return recipients.filter(
      (recipient) => !alreadyMaterializedIds.has(recipient.messageId),
    );
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

    const batchSize = resolveCampaignSendBatchSize(
      this.twentyConfigService.get('EMAIL_SEND_RATE_LIMITING_LIMIT'),
    );

    await this.campaignSendQueueService.bulkAdd<SendCampaignEmailBatchJobData>(
      SEND_CAMPAIGN_EMAIL_BATCH_JOB,
      chunk(recipients, batchSize).map((batch) => ({
        data: {
          workspaceId,
          campaignId,
          emailingDomainId,
          userWorkspaceId,
          recipients: batch.map((recipient) => ({
            messageId: recipient.messageId,
            personId: recipient.personId,
            email: recipient.email,
          })),
        },
      })),
      {
        retryLimit: CAMPAIGN_SEND_RETRY_LIMIT,
        backoff: CAMPAIGN_SEND_RETRY_BACKOFF,
      },
    );
  }

  private async insertMessagesBeforeTheirDeliveries({
    workspaceId,
    campaignId,
    messageChannelId,
    fromAddress,
    subjectTemplate,
    text,
    now,
    recipients,
  }: {
    workspaceId: string;
    campaignId: string;
    messageChannelId: string;
    fromAddress: string;
    subjectTemplate: string;
    text: string;
    now: Date;
    recipients: CampaignMessageRecipient[];
  }): Promise<void> {
    await this.insertChunk({
      campaignId,
      messageChannelId,
      fromAddress,
      subjectTemplate,
      text,
      now,
      rows: recipients.map((recipient) => ({
        recipient,
        messageId: recipient.messageId,
        threadId: v4(),
        temporaryExternalId: v4(),
      })),
    });

    await this.campaignDeliveryRepository.upsert(
      workspaceId,
      recipients.map((recipient) => ({
        id: recipient.messageId,
        campaignId,
        personId: recipient.personId,
        recipientEmail: recipient.email,
        state: CAMPAIGN_DELIVERY_STATE.QUEUED,
      })),
      { conflictPaths: ['id'], skipUpdateIfNoValuesChanged: true },
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
    await this.workspaceOrmManager.runInWorkspaceTransaction(
      async (transactionScope) => {
        const repositoryFor = <T extends ObjectLiteral>(objectName: string) =>
          transactionScope.getRepository<T>(
            objectName,
            { shouldBypassPermissionChecks: true },
            SKIP_EVENT_EMISSION,
          );

        await repositoryFor<MessageThreadWorkspaceEntity>(
          'messageThread',
        ).insert(rows.map((row) => ({ id: row.threadId })));

        await repositoryFor<MessageWorkspaceEntity>('message').insert(
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

        await repositoryFor<MessageChannelMessageAssociationWorkspaceEntity>(
          'messageChannelMessageAssociation',
        ).insert(
          rows.map((row) => ({
            id: v4(),
            messageId: row.messageId,
            messageChannelId,
            messageExternalId: row.temporaryExternalId,
            messageThreadExternalId: row.temporaryExternalId,
            direction: MessageDirection.OUTGOING,
          })),
        );

        await repositoryFor<MessageParticipantWorkspaceEntity>(
          'messageParticipant',
        ).insert(
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
