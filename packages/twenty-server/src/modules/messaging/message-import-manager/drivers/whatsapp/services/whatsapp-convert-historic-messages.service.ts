import { Injectable } from '@nestjs/common';

import { MessageParticipantRole } from 'twenty-shared/types';

import { WhatsappWebhookHistoryThread } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/types/whatsapp-webhook-history.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WhatsappUpdatePersonService } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/services/whatsapp-update-person.service';
import { WhatsappConvertMessage } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/services/whatsapp-convert-message';
import {
  MessageParticipant,
  MessageWithParticipants,
} from 'src/modules/messaging/message-import-manager/types/message';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

@Injectable()
export class WhatsappConvertHistoricMessagesService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly whatsappUpdatePersonService: WhatsappUpdatePersonService,
    private readonly whatsappConvertMessage: WhatsappConvertMessage,
  ) {}

  async parseThread(
    thread: WhatsappWebhookHistoryThread,
    wabaId: string,
    wabaPhoneNumber: string,
    workspaceId: string,
  ) {
    let parsedMessages: MessageWithParticipants[] = [];
    const userPhoneNumber = thread.id;
    let messageParticipants: MessageParticipant[] = [];

    const context = buildSystemAuthContext(workspaceId);

    const messageChannelRecord =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        context,
        async () => {
          const messageChannelRepository =
            await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
              workspaceId,
              'messageChannel',
            );

          return await messageChannelRepository.findOne({
            where: {
              handle: wabaId,
            },
          });
        },
      );

    const personRecord =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        context,
        async () => {
          const personRepository =
            await this.globalWorkspaceOrmManager.getRepository<PersonWorkspaceEntity>(
              workspaceId,
              'person',
            );

          return await personRepository.findOne({
            where: {
              whatsAppPhoneNumber: { primaryPhoneNumber: userPhoneNumber },
            },
          });
        },
      );

    if (
      !messageChannelRecord ||
      !personRecord ||
      !messageChannelRecord.customData?.whatsappBusinessName
    ) {
      return [];
    }
    const personName = `${personRecord.name?.firstName} ${personRecord.name?.lastName}`;

    const businessDisplayName =
      messageChannelRecord.customData?.whatsappBusinessName;

    for (const message of thread.messages) {
      if (message.from === wabaPhoneNumber) {
        messageParticipants.push({
          role: MessageParticipantRole.TO,
          handle: '+'.concat(userPhoneNumber),
          displayName: personName,
        });
        message.type === 'system'
          ? await this.whatsappUpdatePersonService.updatePerson(
              message.system?.body,
              message.system?.wa_id,
              workspaceId,
            )
          : message.type === 'unsupported'
            ? null // skip unsupported messages
            : parsedMessages.push(
                await this.whatsappConvertMessage.readMessage(
                  messageParticipants,
                  businessDisplayName,
                  '',
                  wabaId,
                  message,
                  workspaceId,
                ),
              );
      } else {
        messageParticipants.push({
          role: MessageParticipantRole.TO,
          handle: '+'.concat(wabaPhoneNumber),
          displayName: businessDisplayName,
        });
        message.type === 'system'
          ? await this.whatsappUpdatePersonService.updatePerson(
              message.system?.body,
              message.system?.wa_id,
              workspaceId,
            )
          : message.type === 'unsupported'
            ? null // skip unsupported messages
            : parsedMessages.push(
                await this.whatsappConvertMessage.readMessage(
                  messageParticipants,
                  personName,
                  '',
                  wabaId,
                  message,
                  workspaceId,
                ),
              );
      }
    }

    return parsedMessages;
  }
}
