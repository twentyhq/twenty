import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { MessageChannelType } from 'twenty-shared/types';
import { Repository } from 'typeorm';

import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import { EmailingDomainDriverFactory } from 'src/engine/core-modules/emailing-domain/drivers/emailing-domain-driver.factory';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { EmailingDomainTenantStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-tenant-status.type';
import { type EmailingDomainEmailContent } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-email-content.type';
import { type EmailingDomainSendEmailRequest } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-input.type';
import { type EmailingDomainSendEmailResult } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-result.type';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { MessageSuppressionService } from 'src/modules/emailing/services/message-suppression.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { type DeliverableRecipients } from 'src/engine/core-modules/emailing-domain/types/deliverable-recipients.type';
import { getDomainFromEmail } from 'src/utils/get-domain-from-email';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { isDefined } from 'twenty-shared/utils';

@Injectable()
export class EmailingDomainSenderService {
  constructor(
    @InjectWorkspaceScopedRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: WorkspaceScopedRepository<EmailingDomainEntity>,
    private readonly emailingDomainDriverFactory: EmailingDomainDriverFactory,
    private readonly messageSuppressionService: MessageSuppressionService,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
  ) {}

  async sendEmail(
    workspaceId: string,
    emailingDomainId: string,
    emailContent: EmailingDomainEmailContent,
  ): Promise<EmailingDomainSendEmailResult> {
    const emailingDomain = await this.findEmailingDomainByIdOrThrow(
      workspaceId,
      emailingDomainId,
    );

    this.assertDomainCanSend(emailingDomain, emailContent.from);

    const recipients = await this.selectDeliverableRecipients(
      workspaceId,
      emailingDomain,
      emailContent,
    );

    const replyTo = await this.resolveReplyTo(workspaceId, emailContent);

    const emailToSend: EmailingDomainSendEmailRequest = {
      ...emailContent,
      workspaceId,
      domain: emailingDomain.domain,
      emailingDomain,
      replyTo,
      to: recipients.to,
      cc: recipients.cc,
      bcc: recipients.bcc,
    };

    return this.emailingDomainDriverFactory
      .getCurrentDriver()
      .sendEmail(emailToSend);
  }

  private async resolveReplyTo(
    workspaceId: string,
    emailContent: EmailingDomainEmailContent,
  ): Promise<string[] | undefined> {
    if (isDefined(emailContent.replyTo) && emailContent.replyTo.length > 0) {
      return emailContent.replyTo;
    }

    const emailGroupChannel = await this.messageChannelRepository.findOne({
      where: {
        workspaceId,
        type: MessageChannelType.EMAIL_GROUP,
        connectedAccount: { handle: emailContent.from },
      },
      relations: { connectedAccount: true },
    });

    const forwardingAddress = emailGroupChannel?.handle;

    return isNonEmptyString(forwardingAddress)
      ? [forwardingAddress]
      : undefined;
  }

  private async findEmailingDomainByIdOrThrow(
    workspaceId: string,
    emailingDomainId: string,
  ): Promise<EmailingDomainEntity> {
    const emailingDomain = await this.emailingDomainRepository.findOne(
      workspaceId,
      { where: { id: emailingDomainId } },
    );

    if (!isDefined(emailingDomain)) {
      throw new EmailingDomainDriverException(
        'Emailing domain not found',
        EmailingDomainDriverExceptionCode.NOT_FOUND,
      );
    }

    return emailingDomain;
  }

  private assertDomainCanSend(
    emailingDomain: EmailingDomainEntity,
    fromAddress: string,
  ): void {
    if (emailingDomain.status !== EmailingDomainStatus.VERIFIED) {
      throw new EmailingDomainDriverException(
        `Emailing domain is not verified (status: ${emailingDomain.status})`,
        EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR,
      );
    }

    if (emailingDomain.tenantStatus !== EmailingDomainTenantStatus.ACTIVE) {
      throw new EmailingDomainDriverException(
        `Sending is suspended for emailing domain ${emailingDomain.domain} (tenantStatus: ${emailingDomain.tenantStatus})`,
        EmailingDomainDriverExceptionCode.SENDING_SUSPENDED,
      );
    }

    const fromAddressDomain = getDomainFromEmail(fromAddress)?.toLowerCase();

    if (fromAddressDomain !== emailingDomain.domain.toLowerCase()) {
      throw new EmailingDomainDriverException(
        `From address ${fromAddress} does not match verified domain ${emailingDomain.domain}`,
        EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR,
      );
    }
  }

  private async selectDeliverableRecipients(
    workspaceId: string,
    emailingDomain: EmailingDomainEntity,
    emailContent: EmailingDomainEmailContent,
  ): Promise<DeliverableRecipients> {
    const allRecipients = [
      ...emailContent.to,
      ...(emailContent.cc ?? []),
      ...(emailContent.bcc ?? []),
    ];

    const suppressedAddresses =
      await this.messageSuppressionService.getSuppressedAddresses(
        workspaceId,
        allRecipients,
      );

    const listUnsubscribedAddresses = await this.getListUnsubscribedAddresses(
      workspaceId,
      allRecipients,
      emailContent.unsubscribeTopicId,
    );

    const isDeliverable = (address: string): boolean => {
      const normalizedAddress = address.trim().toLowerCase();

      return (
        !suppressedAddresses.has(normalizedAddress) &&
        !listUnsubscribedAddresses.has(normalizedAddress)
      );
    };

    const to = emailContent.to.filter(isDeliverable);

    if (to.length === 0) {
      throw new EmailingDomainDriverException(
        `All primary recipients are suppressed for emailing domain ${emailingDomain.domain}`,
        EmailingDomainDriverExceptionCode.ALL_RECIPIENTS_SUPPRESSED,
      );
    }

    return {
      to,
      cc: emailContent.cc?.filter(isDeliverable),
      bcc: emailContent.bcc?.filter(isDeliverable),
    };
  }

  private async getListUnsubscribedAddresses(
    workspaceId: string,
    recipients: string[],
    unsubscribeTopicId: string | undefined,
  ): Promise<Set<string>> {
    if (!isNonEmptyString(unsubscribeTopicId)) {
      return new Set();
    }

    return this.messageSuppressionService.getTopicSuppressedAddresses(
      workspaceId,
      recipients,
      unsubscribeTopicId,
    );
  }
}
