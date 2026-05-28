import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { MAX_CAMPAIGN_RECIPIENTS } from 'twenty-shared/constants';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { EmailingDomainTenantStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-tenant-status.type';
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
import { isNonTrivialRecipientFilter } from 'src/modules/messaging/message-outbound-manager/utils/is-non-trivial-recipient-filter.util';
import { sanitizeCampaignHtml } from 'src/modules/messaging/message-outbound-manager/utils/sanitize-campaign-html.util';

type StartCampaignResult = {
  campaignId: string;
  queuedRecipientCount: number;
  skippedRecipientCount: number;
};

type ResolvedRecipient = {
  personId: string;
  email: string;
};

type ResolvedRecipientSet = {
  recipients: ResolvedRecipient[];
  totalMatchedCount: number;
  totalMatchedWithEmailCount: number;
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
    if (!isNonTrivialRecipientFilter(input.recipientFilter)) {
      throw new MessagingCampaignException(
        'recipientFilter must impose at least one constraint; an empty filter would target every Person in the workspace.',
        MessagingCampaignExceptionCode.EMPTY_RECIPIENT_FILTER,
      );
    }

    const emailingDomain = await this.findVerifiedEmailingDomainOrThrow({
      workspaceId,
      emailingDomainId: input.emailingDomainId,
    });

    this.assertFromAddressMatchesDomain(
      input.fromAddress,
      emailingDomain.domain,
    );

    // Sanitize HTML at the boundary — anything stored or sent later can rely
    // on it being free of <script>, inline event handlers, javascript: URLs,
    // etc.
    const sanitizedBody = sanitizeCampaignHtml(input.bodyTemplate);

    const { recipients, totalMatchedCount, totalMatchedWithEmailCount } =
      await this.resolveRecipientsFromFilter({
        workspaceId,
        recipientFilter: input.recipientFilter,
      });

    if (recipients.length === 0) {
      throw new MessagingCampaignException(
        'No recipients matched the selection (after filtering for primary email).',
        MessagingCampaignExceptionCode.NO_RECIPIENTS_WITH_EMAIL,
      );
    }

    // Three contributors to skipped:
    //   - matched_no_email = totalMatched - totalMatchedWithEmail
    //   - matched_truncated_by_cap = max(0, totalMatchedWithEmail - MAX)
    //   - matched_deduped = (capped count) - (deduped recipients length)
    const noEmailCount = totalMatchedCount - totalMatchedWithEmailCount;
    const truncatedByCapCount = Math.max(
      0,
      totalMatchedWithEmailCount - MAX_CAMPAIGN_RECIPIENTS,
    );
    const cappedCount = Math.min(
      totalMatchedWithEmailCount,
      MAX_CAMPAIGN_RECIPIENTS,
    );
    const dedupedCount = Math.max(0, cappedCount - recipients.length);
    const skippedRecipientCount =
      noEmailCount + truncatedByCapCount + dedupedCount;

    const channel =
      await this.messageChannelMetadataService.findOrCreateWorkspaceTransactionalChannel(
        {
          workspaceId,
          userWorkspaceId,
        },
      );

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
      bodyTemplate: sanitizedBody,
      fromAddress: input.fromAddress,
      replyTo: input.replyTo ?? null,
      status: 'SENDING',
      sentCount: 0,
      bouncedCount: 0,
      failedCount: 0,
      recipientSource: 'RECORD_SELECTION',
    });

    // Materialize all messages first (collecting job specs as we go), then
    // enqueue jobs only after every message row has been persisted. This
    // prevents workers from picking up jobs that reference rows the partial
    // loop never created — a mid-loop failure now fails-fast and marks the
    // campaign FAILED instead of leaving it stuck in SENDING.
    const jobPayloads: MessagingCampaignSendRecipientJobData[] = [];

    try {
      for (const recipient of recipients) {
        const thread = await messageThreadRepository.save({});
        const message = await messageRepository.save({
          subject: input.subject,
          text: sanitizedBody,
          messageThreadId: thread.id,
          deliveryStatus: 'QUEUED',
          sourceType: 'CAMPAIGN',
          sourceCampaignId: campaign.id,
        });

        jobPayloads.push({
          workspaceId,
          campaignId: campaign.id,
          messageId: message.id,
          emailingDomainId: emailingDomain.id,
          messageChannelId: channel.id,
          personId: recipient.personId,
          toAddress: recipient.email,
        });
      }
    } catch (error) {
      this.logger.error(
        `Campaign ${campaign.id} materialization failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      await campaignRepository.update(
        { id: campaign.id },
        { status: 'FAILED', sentAt: new Date() },
      );

      throw new MessagingCampaignException(
        'Failed to materialize campaign recipients — campaign marked as FAILED.',
        MessagingCampaignExceptionCode.MATERIALIZATION_FAILED,
      );
    }

    for (const payload of jobPayloads) {
      await this.emailQueueService.add<MessagingCampaignSendRecipientJobData>(
        MessagingCampaignSendRecipientJob.name,
        payload,
      );
    }

    this.logger.log(
      `Campaign ${campaign.id} queued ${jobPayloads.length} recipients (skipped ${skippedRecipientCount} — noEmail=${noEmailCount}, truncated=${truncatedByCapCount}, deduped=${dedupedCount})`,
    );

    return {
      campaignId: campaign.id,
      queuedRecipientCount: jobPayloads.length,
      skippedRecipientCount,
    };
  }

  // Resolves the GraphQL filter to (personId, email) tuples using the same
  // filter machinery the GraphQL query API uses. Permission checks are NOT
  // bypassed — the caller can only send to People they could read.
  private async resolveRecipientsFromFilter({
    workspaceId,
    recipientFilter,
  }: {
    workspaceId: string;
    recipientFilter: RecordGqlOperationFilter;
  }): Promise<ResolvedRecipientSet> {
    const personRepository =
      await this.globalWorkspaceOrmManager.getRepository<PersonWorkspaceEntity>(
        workspaceId,
        'person',
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

    // Reusable query: just the user's filter, no email NOT-NULL guard.
    const buildFilteredQuery = () => {
      const qb = personRepository.createQueryBuilder('person');

      parser.applyFilterToBuilder(qb, 'person', recipientFilter);
      parser.applyDeletedAtToBuilder(qb, recipientFilter);

      return qb;
    };

    // We want THREE counts:
    //   - totalMatched: matches the user's filter (regardless of email)
    //   - totalMatchedWithEmail: matches AND has a primary email
    //   - recipients: deduped on email, capped at MAX_CAMPAIGN_RECIPIENTS
    const totalMatchedCount = await buildFilteredQuery().getCount();

    const totalMatchedWithEmailCount = await buildFilteredQuery()
      .andWhere('"person"."emailsPrimaryEmail" IS NOT NULL')
      .andWhere('"person"."emailsPrimaryEmail" <> \'\'')
      .getCount();

    // DISTINCT ON email guarantees a single send per address even if multiple
    // Person rows share the same primary email (a common duplicate-import
    // outcome). Order by email then id so the choice of "winning" Person row
    // is deterministic.
    const fetchQb = buildFilteredQuery()
      .andWhere('"person"."emailsPrimaryEmail" IS NOT NULL')
      .andWhere('"person"."emailsPrimaryEmail" <> \'\'')
      .distinctOn(['"person"."emailsPrimaryEmail"'])
      .select([
        '"person"."id" AS "personId"',
        '"person"."emailsPrimaryEmail" AS "email"',
      ])
      .orderBy('"person"."emailsPrimaryEmail"', 'ASC')
      .addOrderBy('"person"."id"', 'ASC')
      .limit(MAX_CAMPAIGN_RECIPIENTS);

    const rows = await fetchQb.getRawMany<ResolvedRecipient>();

    return {
      recipients: rows,
      totalMatchedCount,
      totalMatchedWithEmailCount,
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

    if (emailingDomain.tenantStatus !== EmailingDomainTenantStatus.ACTIVE) {
      throw new MessagingCampaignException(
        `Emailing domain ${emailingDomain.domain} is not active (tenantStatus: ${emailingDomain.tenantStatus})`,
        MessagingCampaignExceptionCode.EMAILING_DOMAIN_NOT_ACTIVE,
      );
    }

    return emailingDomain;
  }

  private assertFromAddressMatchesDomain(
    fromAddress: string,
    domain: string,
  ): void {
    // RFC 5321 allows quoted local parts that contain `@`. Splitting on the
    // first `@` would give the wrong host for `"a@b"@example.com`. Take the
    // LAST `@` instead — that's always the separator before the domain.
    const lastAtIndex = fromAddress.lastIndexOf('@');

    if (lastAtIndex === -1 || lastAtIndex === fromAddress.length - 1) {
      throw new MessagingCampaignException(
        `From address ${fromAddress} is missing a domain part`,
        MessagingCampaignExceptionCode.FROM_ADDRESS_DOMAIN_MISMATCH,
      );
    }

    const addressDomain = fromAddress.slice(lastAtIndex + 1).toLowerCase();

    if (addressDomain !== domain.toLowerCase()) {
      throw new MessagingCampaignException(
        `From address ${fromAddress} does not match verified domain ${domain}`,
        MessagingCampaignExceptionCode.FROM_ADDRESS_DOMAIN_MISMATCH,
      );
    }
  }
}
