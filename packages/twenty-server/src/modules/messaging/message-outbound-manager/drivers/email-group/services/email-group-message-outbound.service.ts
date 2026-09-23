import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { UsageLimitSpeedService } from 'src/engine/core-modules/usage-limit/services/usage-limit-speed.service';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { EmailingDomainSenderService } from 'src/modules/emailing/services/emailing-domain-sender.service';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import {
  MessageChannelException,
  MessageChannelExceptionCode,
} from 'src/engine/metadata-modules/message-channel/message-channel.exception';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { EMAIL_GROUP_SEND_THROTTLE } from 'src/modules/messaging/message-outbound-manager/drivers/email-group/constants/email-group-send-throttle.constant';
import { type MessageOutboundDriver } from 'src/modules/messaging/message-outbound-manager/interfaces/message-outbound-driver.interface';
import { type SendMessageInput } from 'src/modules/messaging/message-outbound-manager/types/send-message-input.type';
import { type SendMessageResult } from 'src/modules/messaging/message-outbound-manager/types/send-message-result.type';
import { buildOutboundThreadingHeaders } from 'src/modules/messaging/message-outbound-manager/utils/build-outbound-threading-headers.util';
import { getDomainFromEmail } from 'src/utils/get-domain-from-email';

@Injectable()
export class EmailGroupMessageOutboundService implements MessageOutboundDriver {
  constructor(
    @InjectWorkspaceScopedRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: WorkspaceScopedRepository<EmailingDomainEntity>,
    private readonly emailingDomainSenderService: EmailingDomainSenderService,
    private readonly usageLimitSpeedService: UsageLimitSpeedService,
    private readonly billingService: BillingService,
    @InjectCacheStorage(CacheStorageNamespace.ModuleMessaging)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  async sendMessage(
    sendMessageInput: SendMessageInput,
    connectedAccount: ConnectedAccountEntity,
  ): Promise<SendMessageResult> {
    const isPayingCustomer = await this.billingService.isPayingCustomer(
      connectedAccount.workspaceId,
    );

    if (!isPayingCustomer) {
      throw new MessageChannelException(
        `Cannot send from ${connectedAccount.handle}: sending from an email group is available once your workspace is on a paid plan and has been billed.`,
        MessageChannelExceptionCode.EMAIL_GROUP_SENDING_REQUIRES_PAID_PLAN,
      );
    }

    const emailingDomain = await this.resolveEmailingDomain(connectedAccount);

    if (emailingDomain.status !== EmailingDomainStatus.VERIFIED) {
      throw new MessageChannelException(
        `Cannot send from ${connectedAccount.handle}: domain ${emailingDomain.domain} is not verified for outbound (status: ${emailingDomain.status}).`,
        MessageChannelExceptionCode.EMAIL_GROUP_NOT_CONFIGURED,
      );
    }

    const recipientCount =
      this.toRecipientArray(sendMessageInput.to).length +
      this.toRecipientArray(sendMessageInput.cc).length +
      this.toRecipientArray(sendMessageInput.bcc).length;

    await this.usageLimitSpeedService.consumeOrThrow({
      resourceType: UsageResourceType.EMAIL,
      operationType: UsageOperationType.EMAIL_SEND,
      authContext: buildSystemAuthContext(connectedAccount.workspaceId),
      cost: recipientCount,
    });

    const dailyRecipientCountKey = this.buildDailyRecipientCountKey(
      connectedAccount.workspaceId,
    );

    await this.consumeDailyRecipientAllowanceOrThrow(
      dailyRecipientCountKey,
      recipientCount,
    );

    const threadExternalId =
      sendMessageInput.threadExternalId ??
      sendMessageInput.inReplyTo ??
      `<${v4()}@${emailingDomain.domain}>`;

    const result = await this.emailingDomainSenderService
      .sendEmail(connectedAccount.workspaceId, emailingDomain.id, {
        sendKind: 'TRANSACTIONAL',
        to: this.toRecipientArray(sendMessageInput.to),
        cc: this.toRecipientArray(sendMessageInput.cc),
        bcc: this.toRecipientArray(sendMessageInput.bcc),
        subject: sendMessageInput.subject,
        text: sendMessageInput.body,
        html: isNonEmptyString(sendMessageInput.html)
          ? sendMessageInput.html
          : undefined,
        from: connectedAccount.handle,
        replyTo: [connectedAccount.handle],
        attachments: sendMessageInput.attachments,
        headers: buildOutboundThreadingHeaders({
          threadExternalId,
          inReplyTo: sendMessageInput.inReplyTo,
          references: sendMessageInput.references,
        }),
      })
      .catch(async (error) => {
        await this.cacheStorage.incrBy(dailyRecipientCountKey, -recipientCount);

        throw error;
      });

    return {
      headerMessageId: result.headerMessageId ?? result.messageId,
      messageExternalId: result.messageId,
      threadExternalId,
      deliveredRecipients: result.deliveredRecipients,
    };
  }

  async createDraft(): Promise<void> {
    throw new MessageChannelException(
      'Email handle channels do not support drafts.',
      MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
    );
  }

  async sendDraft(): Promise<SendMessageResult> {
    throw new MessageChannelException(
      'Email handle channels do not support drafts.',
      MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
    );
  }

  private async resolveEmailingDomain(
    connectedAccount: ConnectedAccountEntity,
  ): Promise<EmailingDomainEntity> {
    const handleDomain = getDomainFromEmail(connectedAccount.handle);

    if (!isNonEmptyString(handleDomain)) {
      throw new MessageChannelException(
        `Email group ${connectedAccount.handle} has no domain.`,
        MessageChannelExceptionCode.EMAIL_GROUP_NOT_CONFIGURED,
      );
    }

    const emailingDomain = await this.emailingDomainRepository.findOne(
      connectedAccount.workspaceId,
      {
        where: { domain: handleDomain },
      },
    );

    if (!isDefined(emailingDomain)) {
      throw new MessageChannelException(
        `No outbound domain configured for ${handleDomain}. Verify it under Outbound Domains to send from ${connectedAccount.handle}.`,
        MessageChannelExceptionCode.EMAIL_GROUP_NOT_CONFIGURED,
      );
    }

    return emailingDomain;
  }

  private buildDailyRecipientCountKey(workspaceId: string): string {
    const windowIndex = Math.floor(
      Date.now() / EMAIL_GROUP_SEND_THROTTLE.windowMs,
    );

    return `email-group-send:recipients:${workspaceId}:${windowIndex}`;
  }

  private async consumeDailyRecipientAllowanceOrThrow(
    dailyRecipientCountKey: string,
    recipientCount: number,
  ): Promise<void> {
    const recipientCountInWindow = await this.cacheStorage.incrBy(
      dailyRecipientCountKey,
      recipientCount,
    );

    await this.cacheStorage.expire(
      dailyRecipientCountKey,
      EMAIL_GROUP_SEND_THROTTLE.windowMs,
    );

    if (recipientCountInWindow <= EMAIL_GROUP_SEND_THROTTLE.maxRecipients) {
      return;
    }

    await this.cacheStorage.incrBy(dailyRecipientCountKey, -recipientCount);

    throw new ThrottlerException(
      `Email group send limit reached: ${EMAIL_GROUP_SEND_THROTTLE.maxRecipients} recipients per day.`,
      ThrottlerExceptionCode.LIMIT_REACHED,
    );
  }

  private toRecipientArray(value: string | string[] | undefined): string[] {
    if (!isDefined(value)) {
      return [];
    }

    return Array.isArray(value) ? value : [value];
  }
}
