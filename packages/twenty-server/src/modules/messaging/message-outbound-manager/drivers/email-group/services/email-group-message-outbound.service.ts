import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';
import { EmailBillingService } from 'src/modules/emailing/services/email-billing.service';
import { EmailingDomainSenderService } from 'src/modules/emailing/services/emailing-domain-sender.service';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import {
  MessageChannelException,
  MessageChannelExceptionCode,
} from 'src/engine/metadata-modules/message-channel/message-channel.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { type MessageOutboundDriver } from 'src/modules/messaging/message-outbound-manager/interfaces/message-outbound-driver.interface';
import { type SendMessageInput } from 'src/modules/messaging/message-outbound-manager/types/send-message-input.type';
import { type SendMessageResult } from 'src/modules/messaging/message-outbound-manager/types/send-message-result.type';
import { buildOutboundThreadingHeaders } from 'src/modules/messaging/message-outbound-manager/utils/build-outbound-threading-headers.util';
import { getDomainFromEmail } from 'src/utils/get-domain-from-email';
import { countDeliveredRecipients } from 'src/engine/core-modules/emailing-domain/utils/count-delivered-recipients.util';

@Injectable()
export class EmailGroupMessageOutboundService implements MessageOutboundDriver {
  private readonly logger = new Logger(EmailGroupMessageOutboundService.name);

  constructor(
    @InjectWorkspaceScopedRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: WorkspaceScopedRepository<EmailingDomainEntity>,
    private readonly emailingDomainSenderService: EmailingDomainSenderService,
    private readonly emailBillingService: EmailBillingService,
  ) {}

  async sendMessage({
    sendMessageInput,
    connectedAccount,
    spenders = {},
  }: {
    sendMessageInput: SendMessageInput;
    connectedAccount: ConnectedAccountEntity;
    spenders?: UsageSpenders;
  }): Promise<SendMessageResult> {
    const emailingDomain = await this.resolveEmailingDomain(connectedAccount);

    if (emailingDomain.status !== EmailingDomainStatus.VERIFIED) {
      throw new MessageChannelException(
        `Cannot send from ${connectedAccount.handle}: domain ${emailingDomain.domain} is not verified for outbound (status: ${emailingDomain.status}).`,
        MessageChannelExceptionCode.EMAIL_GROUP_NOT_CONFIGURED,
      );
    }

    await this.emailBillingService.validateEmailSendOrThrow({
      workspaceId: connectedAccount.workspaceId,
      spenders,
    });

    const threadExternalId =
      sendMessageInput.threadExternalId ??
      sendMessageInput.inReplyTo ??
      `<${v4()}@${emailingDomain.domain}>`;

    const result = await this.emailingDomainSenderService.sendEmail(
      connectedAccount.workspaceId,
      emailingDomain.id,
      {
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
      },
    );

    // The provider has already accepted the mail, so surfacing a billing
    // failure would invite a retry that sends it a second time.
    await this.emailBillingService
      .billSentEmails({
        workspaceId: connectedAccount.workspaceId,
        spenders,
        sentEmailCount: countDeliveredRecipients(result.deliveredRecipients),
      })
      .catch((error) => {
        this.logger.error(
          `Workspace ${connectedAccount.workspaceId} sent email ${result.messageId} but failed to bill it, so this send is unbilled: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
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

  private toRecipientArray(value: string | string[] | undefined): string[] {
    if (!isDefined(value)) {
      return [];
    }

    return Array.isArray(value) ? value : [value];
  }
}
