import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { EmailingDomainSenderService } from 'src/engine/core-modules/emailing-domain/services/emailing-domain-sender.service';
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
import { getDomainFromEmail } from 'src/utils/get-domain-from-email';

@Injectable()
export class EmailGroupMessageOutboundService implements MessageOutboundDriver {
  constructor(
    @InjectWorkspaceScopedRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: WorkspaceScopedRepository<EmailingDomainEntity>,
    private readonly emailingDomainSenderService: EmailingDomainSenderService,
  ) {}

  async sendMessage(
    sendMessageInput: SendMessageInput,
    connectedAccount: ConnectedAccountEntity,
  ): Promise<SendMessageResult> {
    const emailingDomain = await this.resolveEmailingDomain(connectedAccount);

    if (emailingDomain.status !== EmailingDomainStatus.VERIFIED) {
      throw new MessageChannelException(
        `Cannot send from ${connectedAccount.handle}: domain ${emailingDomain.domain} is not verified for outbound (status: ${emailingDomain.status}).`,
        MessageChannelExceptionCode.EMAIL_GROUP_NOT_CONFIGURED,
      );
    }

    const result = await this.emailingDomainSenderService.sendEmail(
      connectedAccount.workspaceId,
      emailingDomain.id,
      {
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
      },
    );

    return {
      headerMessageId: result.messageId,
      messageExternalId: result.messageId,
      deliveredRecipients: result.deliveredRecipients,
    };
  }

  async createDraft(): Promise<void> {
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
