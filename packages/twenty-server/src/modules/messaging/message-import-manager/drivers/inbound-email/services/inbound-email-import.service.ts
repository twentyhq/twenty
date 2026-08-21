import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { MessageChannelType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { InboundEmailMessageSourceResolverService } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/sources/inbound-email-message-source-resolver.service';
import { type InboundEmailImportOutcome } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/types/inbound-email-import-outcome.type';
import { type InboundEmailMessageReference } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/types/inbound-email-message-reference.type';
import { MessagingSaveMessagesAndEnqueueContactCreationService } from 'src/modules/messaging/message-import-manager/services/messaging-save-messages-and-enqueue-contact-creation.service';

type ImportInboundMessageParams = {
  messageReference: InboundEmailMessageReference;
  envelopeRecipients: string[];
};

@Injectable()
export class InboundEmailImportService {
  private readonly logger = new Logger(InboundEmailImportService.name);

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly inboundEmailMessageSourceResolverService: InboundEmailMessageSourceResolverService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly messagingSaveMessagesAndEnqueueContactCreationService: MessagingSaveMessagesAndEnqueueContactCreationService,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
  ) {}

  async importInboundMessage(
    params: ImportInboundMessageParams,
  ): Promise<InboundEmailImportOutcome> {
    const { messageReference, envelopeRecipients } = params;

    const inboundEmailDomain = this.twentyConfigService.get(
      'INBOUND_EMAIL_DOMAIN',
    );

    if (!isNonEmptyString(inboundEmailDomain)) {
      this.logger.warn(
        `Skipping inbound email import for ${messageReference.reference}: email group is not configured.`,
      );

      return { kind: 'unconfigured' };
    }

    const messageSource = this.inboundEmailMessageSourceResolverService.resolve(
      messageReference.source,
    );

    if (!messageSource.isConfigured()) {
      this.logger.warn(
        `Skipping inbound email import for ${messageReference.reference}: message source ${messageReference.source} is not configured.`,
      );

      return { kind: 'unconfigured' };
    }

    const recipient = this.matchInboundRecipient(
      envelopeRecipients,
      inboundEmailDomain,
    );

    if (!isDefined(recipient)) {
      this.logger.warn(
        `No recipient at ${inboundEmailDomain} in inbound notification for ${messageReference.reference}`,
      );

      return { kind: 'unmatched', recipient: null };
    }

    const messageChannel = await this.messageChannelRepository.findOne({
      where: { handle: recipient, type: MessageChannelType.EMAIL_GROUP },
    });

    if (!isDefined(messageChannel)) {
      this.logger.warn(
        `No email group channel matches recipient ${recipient} (reference ${messageReference.reference})`,
      );

      return { kind: 'unmatched', recipient };
    }

    const message = await messageSource.fetchMessage(
      messageReference.reference,
    );

    const { workspaceId } = messageChannel;

    const connectedAccount = await this.connectedAccountRepository.findOne({
      where: { id: messageChannel.connectedAccountId, workspaceId },
    });

    if (!isDefined(connectedAccount)) {
      throw new Error(
        `Email group channel ${messageChannel.id} has no connected account`,
      );
    }

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        await this.messagingSaveMessagesAndEnqueueContactCreationService.saveMessagesAndEnqueueContactCreation(
          [message],
          messageChannel,
          connectedAccount,
          workspaceId,
        );
      },
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );

    await messageSource.cleanup(messageReference.reference);

    return {
      kind: 'imported',
      workspaceId,
      messageChannelId: messageChannel.id,
    };
  }

  private matchInboundRecipient(
    envelopeRecipients: string[],
    inboundEmailDomain: string,
  ): string | null {
    const normalizedDomain = inboundEmailDomain.toLowerCase();

    return (
      envelopeRecipients
        .map((address) => address.toLowerCase())
        .find((address) => address.endsWith(`@${normalizedDomain}`)) ?? null
    );
  }
}
