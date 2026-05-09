import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MessageChannelType } from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { InboundEmailS3ClientProvider } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/providers/inbound-email-s3-client.provider';
import { InboundEmailParserService } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/services/inbound-email-parser.service';
import { InboundEmailStorageService } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/services/inbound-email-storage.service';
import { type InboundEmailImportOutcome } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/types/inbound-email-import-outcome.type';
import { MessagingSaveMessagesAndEnqueueContactCreationService } from 'src/modules/messaging/message-import-manager/services/messaging-save-messages-and-enqueue-contact-creation.service';
import { isDefined } from 'twenty-shared/utils';

type ImportInboundMessageParams = {
  s3Key: string;
  envelopeRecipients: string[];
};

@Injectable()
export class InboundEmailImportService {
  private readonly logger = new Logger(InboundEmailImportService.name);

  constructor(
    private readonly inboundEmailS3ClientProvider: InboundEmailS3ClientProvider,
    private readonly inboundEmailStorageService: InboundEmailStorageService,
    private readonly inboundEmailParserService: InboundEmailParserService,
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
    const { s3Key, envelopeRecipients } = params;

    if (!this.inboundEmailS3ClientProvider.isConfigured()) {
      this.logger.warn(
        `Skipping inbound email import for ${s3Key}: email group is not configured.`,
      );

      return { kind: 'unconfigured' };
    }

    const inboundEmailDomain = this.inboundEmailS3ClientProvider.getDomain();
    const recipient = this.matchInboundRecipient(
      envelopeRecipients,
      inboundEmailDomain,
    );

    if (!isDefined(recipient)) {
      this.logger.warn(
        `No recipient at ${inboundEmailDomain} in SNS payload for ${s3Key}`,
      );

      return { kind: 'unmatched', recipient: null };
    }

    const messageChannel = await this.messageChannelRepository.findOne({
      where: { handle: recipient, type: MessageChannelType.EMAIL_GROUP },
    });

    if (!isDefined(messageChannel)) {
      this.logger.warn(
        `No email group channel matches recipient ${recipient} (key ${s3Key})`,
      );

      return { kind: 'unmatched', recipient };
    }

    const rawMessage =
      await this.inboundEmailStorageService.getRawMessage(s3Key);
    const parsedInboundMessage = await this.inboundEmailParserService.parse(
      rawMessage,
      s3Key,
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

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.messagingSaveMessagesAndEnqueueContactCreationService.saveMessagesAndEnqueueContactCreation(
        [parsedInboundMessage.message],
        messageChannel,
        connectedAccount,
        workspaceId,
      );
    }, buildSystemAuthContext(workspaceId));

    await this.inboundEmailStorageService.deleteRawMessage(s3Key);

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
