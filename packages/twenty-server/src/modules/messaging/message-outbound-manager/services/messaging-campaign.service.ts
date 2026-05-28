import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { MAX_CAMPAIGN_RECIPIENTS } from 'twenty-shared/constants';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MessageChannelMetadataService } from 'src/engine/metadata-modules/message-channel/message-channel-metadata.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { getObjectMetadataFromEntityTarget } from 'src/engine/twenty-orm/utils/get-object-metadata-from-entity-target.util';
import { type MessageCampaignWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-campaign.workspace-entity';
import { type MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import {
  MessagingCampaignException,
  MessagingCampaignExceptionCode,
} from 'src/modules/messaging/message-outbound-manager/exceptions/messaging-campaign.exception';
import { type SendMessageCampaignInput } from 'src/modules/messaging/message-outbound-manager/dtos/send-message-campaign.input';
import {
  MessagingCampaignSendRecipientJob,
  type MessagingCampaignSendRecipientJobData,
} from 'src/modules/messaging/message-outbound-manager/jobs/messaging-campaign-send-recipient.job';

type StartCampaignResult = {
  campaignId: string;
  queuedRecipientCount: number;
  skippedRecipientCount: number;
};

type ResolvedRecipient = {
  personId: string;
  email: string;
};

@Injectable()
export class MessagingCampaignService {
  private readonly logger = new Logger(MessagingCampaignService.name);

  constructor(
    @InjectRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: Repository<EmailingDomainEntity>,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly messageChannelMetadataService: MessageChannelMetadataService,
    @InjectMessageQueue(MessageQueue.emailQueue)
    private readonly emailQueueService: MessageQueueService,
  ) {}

  async startCampaign({
    workspaceId,
    userWorkspaceId,
    input,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    input: SendMessageCampaignInput;
  }): Promise<StartCampaignResult> {
    const emailingDomain = await this.findVerifiedEmailingDomainOrThrow({
      workspaceId,
      emailingDomainId: input.emailingDomainId,
    });

    this.assertFromAddressMatchesDomain(
      input.fromAddress,
      emailingDomain.domain,
    );

    const channel =
      await this.messageChannelMetadataService.findOrCreateWorkspaceTransactionalChannel(
        {
          workspaceId,
          userWorkspaceId,
        },
      );

    const { recipients, totalMatchedCount } =
      await this.resolveRecipientsFromFilter({
        workspaceId,
        recipientFilter: input.recipientFilter,
      });

    if (recipients.length === 0) {
      throw new MessagingCampaignException(
        'None of the matching recipients have a primary email address',
        MessagingCampaignExceptionCode.NO_RECIPIENTS_WITH_EMAIL,
      );
    }

    // Truncation due to the recipient cap counts as "skipped" alongside
    // recipients without an email.
    const truncatedCount = Math.max(
      0,
      totalMatchedCount - MAX_CAMPAIGN_RECIPIENTS,
    );
    const skippedRecipientCount =
      truncatedCount + (Math.min(totalMatchedCount, MAX_CAMPAIGN_RECIPIENTS) -
        recipients.length);

    const campaignRepository =
      await this.globalWorkspaceOrmManager.getRepository<MessageCampaignWorkspaceEntity>(
        workspaceId,
        'messageCampaign',
      );

    const messageThreadRepository =
      await this.globalWorkspaceOrmManager.getRepository<MessageThreadWorkspaceEntity>(
        workspaceId,
        'messageThread',
        { shouldBypassPermissionChecks: true },
      );

    const messageRepository =
      await this.globalWorkspaceOrmManager.getRepository<MessageWorkspaceEntity>(
        workspaceId,
        'message',
        { shouldBypassPermissionChecks: true },
      );

    const campaign = await campaignRepository.save({
      name: input.name,
      subject: input.subject,
      bodyTemplate: input.bodyTemplate,
      fromAddress: input.fromAddress,
      replyTo: input.replyTo ?? null,
      status: 'SENDING',
      sentCount: 0,
      bouncedCount: 0,
      failedCount: 0,
      recipientSource: 'RECORD_SELECTION',
    });

    // One thread + one message per recipient. Lets replies (if reply-to is a
    // synced mailbox) thread naturally and avoids cross-recipient leakage.
    const messageIds: string[] = [];

    for (const recipient of recipients) {
      const thread = await messageThreadRepository.save({});
      const message = await messageRepository.save({
        subject: input.subject,
        text: input.bodyTemplate,
        messageThreadId: thread.id,
        deliveryStatus: 'QUEUED',
        sourceType: 'CAMPAIGN',
        sourceCampaignId: campaign.id,
      });

      messageIds.push(message.id);

      await this.emailQueueService.add<MessagingCampaignSendRecipientJobData>(
        MessagingCampaignSendRecipientJob.name,
        {
          workspaceId,
          campaignId: campaign.id,
          messageId: message.id,
          emailingDomainId: emailingDomain.id,
          messageChannelId: channel.id,
          personId: recipient.personId,
          toAddress: recipient.email,
        },
      );
    }

    this.logger.log(
      `Campaign ${campaign.id} queued ${messageIds.length} recipients (skipped ${skippedRecipientCount})`,
    );

    return {
      campaignId: campaign.id,
      queuedRecipientCount: messageIds.length,
      skippedRecipientCount,
    };
  }

  // Resolves the GraphQL filter to (personId, email) tuples using the same
  // filter machinery the GraphQL query API uses. Caps at
  // MAX_CAMPAIGN_RECIPIENTS server-side regardless of how many rows match.
  private async resolveRecipientsFromFilter({
    workspaceId,
    recipientFilter,
  }: {
    workspaceId: string;
    recipientFilter: RecordGqlOperationFilter;
  }): Promise<{
    recipients: ResolvedRecipient[];
    totalMatchedCount: number;
  }> {
    const personRepository =
      await this.globalWorkspaceOrmManager.getRepository<PersonWorkspaceEntity>(
        workspaceId,
        'person',
        { shouldBypassPermissionChecks: true },
      );

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      personRepository.internalContext;

    const personFlatObjectMetadata = getObjectMetadataFromEntityTarget(
      'person',
      personRepository.internalContext,
    );

    const parser = new GraphqlQueryParser(
      personFlatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    );

    // We build two queries: one for the count (so we can report
    // truncation accurately) and one for the actual fetch capped at
    // MAX_CAMPAIGN_RECIPIENTS. Both share the same filter.
    const buildBaseQuery = () => {
      const qb = personRepository.createQueryBuilder('person');
      parser.applyFilterToBuilder(qb, 'person', recipientFilter);
      parser.applyDeletedAtToBuilder(qb, recipientFilter);

      // Skip rows without a usable primary email — we'd have to discard
      // them anyway after fetching.
      qb.andWhere('"person"."emailsPrimaryEmail" IS NOT NULL').andWhere(
        '"person"."emailsPrimaryEmail" <> \'\'',
      );

      return qb;
    };

    const countQb = buildBaseQuery();
    const totalMatchedCount = await countQb.getCount();

    const fetchQb = buildBaseQuery()
      .select([
        '"person"."id" AS "personId"',
        '"person"."emailsPrimaryEmail" AS "email"',
      ])
      .orderBy('"person"."id"', 'ASC')
      .take(MAX_CAMPAIGN_RECIPIENTS);

    const rows = await fetchQb.getRawMany<ResolvedRecipient>();

    return {
      recipients: rows,
      totalMatchedCount,
    };
  }

  private async findVerifiedEmailingDomainOrThrow({
    workspaceId,
    emailingDomainId,
  }: {
    workspaceId: string;
    emailingDomainId: string;
  }): Promise<EmailingDomainEntity> {
    const emailingDomain = await this.emailingDomainRepository.findOne({
      where: { id: emailingDomainId, workspaceId },
    });

    if (!emailingDomain) {
      throw new MessagingCampaignException(
        `Emailing domain ${emailingDomainId} not found`,
        MessagingCampaignExceptionCode.EMAILING_DOMAIN_NOT_FOUND,
      );
    }

    if (emailingDomain.status !== EmailingDomainStatus.VERIFIED) {
      throw new MessagingCampaignException(
        `Emailing domain ${emailingDomain.domain} is not verified (status: ${emailingDomain.status})`,
        MessagingCampaignExceptionCode.EMAILING_DOMAIN_NOT_VERIFIED,
      );
    }

    return emailingDomain;
  }

  private assertFromAddressMatchesDomain(
    fromAddress: string,
    domain: string,
  ): void {
    const addressDomain = fromAddress.split('@')[1]?.toLowerCase();

    if (addressDomain !== domain.toLowerCase()) {
      throw new MessagingCampaignException(
        `From address ${fromAddress} does not match verified domain ${domain}`,
        MessagingCampaignExceptionCode.FROM_ADDRESS_DOMAIN_MISMATCH,
      );
    }
  }
}
