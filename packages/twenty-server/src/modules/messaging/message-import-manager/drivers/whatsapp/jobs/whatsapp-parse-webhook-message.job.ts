import { Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { WhatsAppWebhookMessage } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/types/whatsapp-webhook-message.type';
import { WhatsappWebhookHistory } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/types/whatsapp-webhook-history.type';
import { MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { WhatsappConvertHistoricMessagesService } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/services/whatsapp-convert-historic-messages.service';
import { WhatsappConvertMessage } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/services/whatsapp-convert-message';
import { IntegrationsEntity } from 'src/engine/metadata-modules/integrations/integrations.entity';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  MessagingSaveNonEmailMessagesJob,
  MessagingSaveNonEmailMessagesJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-save-non-email-messages.job';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

export type WhatsappParseWebhookMessageJobData = {
  dataType: string;
  data: WhatsAppWebhookMessage | WhatsappWebhookHistory;
};

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST, // I guess?
})
export class WhatsappParseWebhookMessageJob {
  constructor(
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectRepository(IntegrationsEntity)
    private readonly integrationsRepository: Repository<IntegrationsEntity>,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly whatsappConvertMessage: WhatsappConvertMessage,
    private readonly whatsappConvertHistoricMessagesService: WhatsappConvertHistoricMessagesService,
  ) {}

  @Process(WhatsappParseWebhookMessageJob.name)
  async handle(data: WhatsappParseWebhookMessageJobData): Promise<void> {
    let convertedMessages: MessageWithParticipants[] = [];
    let workspaceId = '';
    let whatsappBusinessAccountId = '';

    if (data.dataType === 'message') {
      const messages = data.data as WhatsAppWebhookMessage;

      whatsappBusinessAccountId = messages.entry[0].id;
      const workspaceIdByWABAId = await this.integrationsRepository.findOneBy({
        whatsappBusinessAccountId: whatsappBusinessAccountId,
      });

      if (workspaceIdByWABAId === null) {
        throw new Error(); // TODO: check
      }

      workspaceId = workspaceIdByWABAId.workspace.id;

      for (const change of messages.entry[0].changes) {
        if (change.value.errors === undefined) {
          for (const message of await this.whatsappConvertMessage.convertFromWhatsappMessageToMessageWithParticipants(
            change,
            whatsappBusinessAccountId,
            workspaceId,
          )) {
            convertedMessages.push(message);
          }
        }
      }
    } else {
      const history = data.data as WhatsappWebhookHistory;
      const whatsappBusinessPhoneNumber =
        history.entry[0].changes[0].value.metadata.display_phone_number;

      whatsappBusinessAccountId = history.entry[0].id;
      const workspaceIdByWABAId = await this.integrationsRepository.findOneBy({
        whatsappBusinessAccountId: whatsappBusinessAccountId,
      });

      if (workspaceIdByWABAId === null) {
        throw new Error(); // TODO: check
      }
      workspaceId = workspaceIdByWABAId.workspace.id;

      for (const thread of history.entry[0].changes[0].value.history[0]
        .threads) {
        for (const message of await this.whatsappConvertHistoricMessagesService.parseThread(
          thread,
          whatsappBusinessAccountId,
          whatsappBusinessPhoneNumber,
          workspaceId,
        )) {
          convertedMessages.push(message);
        }
      }
    }
    if (convertedMessages.length == 0) {
      throw new Error(); // TODO: check
    }
    const authContext = buildSystemAuthContext(workspaceId);

    const { connectedAccount, messageChannel } =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        authContext,
        async () => {
          const connectedAccountRepository =
            await this.globalWorkspaceOrmManager.getRepository<ConnectedAccountWorkspaceEntity>(
              workspaceId,
              'connectedAccount',
            );

          const messageChannelRepository =
            await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
              workspaceId,
              'messageChannel',
            );

          const connectedAccount = await connectedAccountRepository.findOne({
            where: { handle: whatsappBusinessAccountId },
          });

          if (!connectedAccount) {
            throw new Error(); // TODO: check
          }

          const messageChannel = await messageChannelRepository.findOne({
            where: { connectedAccountId: connectedAccount.id },
          });

          if (!messageChannel) {
            throw new Error(); // TODO: check
          }

          return { connectedAccount, messageChannel };
        },
      );

    await this.messageQueueService.add<MessagingSaveNonEmailMessagesJobData>(
      MessagingSaveNonEmailMessagesJob.name,
      {
        connectedAccount,
        messageChannel,
        messagesToSave: convertedMessages,
        workspaceId,
      },
    );
  }
}
