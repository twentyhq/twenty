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
import { IntegrationsEntity } from 'src/engine/metadata-modules/integrations/whatsapp/integrations.entity';

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
    @InjectRepository(IntegrationsEntity)
    private readonly integrationsRepository: Repository<IntegrationsEntity>,
    private readonly whatsappConvertMessage: WhatsappConvertMessage,
    private readonly whatsappConvertHistoricMessagesService: WhatsappConvertHistoricMessagesService,
  ) {}

  @Process(WhatsappParseWebhookMessageJob.name)
  async handle(data: WhatsappParseWebhookMessageJobData): Promise<void> {
    let convertedMessages: MessageWithParticipants[] = [];

    if (data.dataType === 'message') {
      const messages = data.data as WhatsAppWebhookMessage;

      const whatsappBusinessAccountId = messages.entry[0].id;
      const workspaceIdByWABAId = await this.integrationsRepository.findOneBy({
        whatsappBusinessAccountId: whatsappBusinessAccountId,
      });

      if (workspaceIdByWABAId !== null && workspaceIdByWABAId.workspace.id) {
        const workspaceId = workspaceIdByWABAId.workspace.id;

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
      }
    } else {
      const history = data.data as WhatsappWebhookHistory;
      const wabaId = history.entry[0].id;
      const wabaPhoneNumber =
        history.entry[0].changes[0].value.metadata.display_phone_number;

      for (const thread of history.entry[0].changes[0].value.history[0]
        .threads) {
        for (const message of await this.whatsappConvertHistoricMessagesService.parseThread(
          thread,
          wabaId,
          wabaPhoneNumber,
        )) {
          convertedMessages.push(message);
        }
      }
    }
    convertedMessages.splice(0, 0); // TODO: pass it to different job
  }
}
