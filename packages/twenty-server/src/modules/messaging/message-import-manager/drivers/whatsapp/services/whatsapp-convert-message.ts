import { Injectable } from '@nestjs/common';

import { MessageParticipantRole } from 'twenty-shared/types';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import {
  WhatsappWebhookMessageChanges,
  WhatsappWebhookMessageContent,
} from 'src/modules/messaging/message-import-manager/drivers/whatsapp/types/whatsapp-webhook-message.type';
import {
  MessageParticipant,
  MessageWithParticipants,
} from 'src/modules/messaging/message-import-manager/types/message';
import { WhatsappUpdatePersonService } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/services/whatsapp-update-person.service';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { WhatsappDownloadMediaService } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/services/whatsapp-download-media.service';
import { WhatsappFormatGroupParticipantsToMessageParticipantsService } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/services/whatsapp-format-group-participants-to-message-participants.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WhatsappWorkspaceEntity } from 'src/modules/integrations/whatsapp-workspace.entity';

@Injectable()
export class WhatsappConvertMessage {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly whatsappUpdatePersonService: WhatsappUpdatePersonService,
    private readonly whatsappDownloadMediaService: WhatsappDownloadMediaService,
    private readonly whatsappGroupFormatService: WhatsappFormatGroupParticipantsToMessageParticipantsService,
  ) {}

  async convertFromWhatsappMessageToMessageWithParticipants(
    change: WhatsappWebhookMessageChanges,
    whatsappBusinessAccountId: string,
    workspaceId: string,
    bearerToken: string,
  ): Promise<MessageWithParticipants[]> {
    // TODO: how to find sender's name in array if wa_id and from may not be the same?
    // When there are more than 1 contact?
    const messageSenderContactName =
      change.value.contacts?.[0].profile.name ?? null;
    const messageSenderId = change.value.contacts?.[0].wa_id ?? '';
    const authContext = buildSystemAuthContext(workspaceId);
    let parsedMessages: MessageWithParticipants[] = [];
    let participants: MessageParticipant[] = [];

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const integrationsRepository =
          await this.globalWorkspaceOrmManager.getRepository<WhatsappWorkspaceEntity>(
            workspaceId,
            'whatsapp',
          );

        const whatsappRecord = await integrationsRepository.findOne({
          where: { businessAccountId: whatsappBusinessAccountId },
        });

        if (whatsappRecord === null) {
          return [];
        }
        const messageReceiver: MessageParticipant = {
          role: MessageParticipantRole.TO,
          handle: change.value.metadata.display_phone_number,
          displayName: whatsappRecord.businessDisplayName,
        };

        participants.push(messageReceiver);
      },
    );

    change.value.messages?.forEach(async (message) => {
      message.type === 'system'
        ? await this.whatsappUpdatePersonService.updatePerson(
            message.system?.body,
            message.system?.wa_id,
            workspaceId,
          )
        : message.type === 'unsupported'
          ? null // skip unsupported messages
          : parsedMessages.push(
              await this.readMessage(
                participants,
                messageSenderContactName,
                messageSenderId,
                whatsappBusinessAccountId,
                message,
                workspaceId,
                bearerToken,
              ),
            );
    });

    return parsedMessages;
  }

  private async readMessage(
    participants: MessageParticipant[],
    messageSenderContactName: string | null,
    messageSenderId: string,
    whatsappBusinessAccountId: string,
    message: WhatsappWebhookMessageContent,
    workspaceId: string,
    bearerToken: string,
  ): Promise<MessageWithParticipants> {
    let attachments: { filename: string }[] = [];
    let text: string | null = null;
    const externalId: string = message.id;
    const receivedAt: Date = new Date(parseInt(message.timestamp));
    const messageSender: MessageParticipant = {
      role: MessageParticipantRole.FROM,
      handle: message.from, // phone number
      displayName: messageSenderContactName,
    };

    participants.push(messageSender);

    if (message.group_id !== undefined) {
      const formattedMessageParticipants: MessageParticipant[] =
        await this.whatsappGroupFormatService.formatGroupParticipantsToMessageParticipants(
          workspaceId,
          message.group_id,
          messageSenderId,
          whatsappBusinessAccountId,
        );

      for (const participant of formattedMessageParticipants) {
        participants.push(participant);
      }
    }

    switch (message.type) {
      case 'audio':
        attachments.push({
          filename: await this.whatsappDownloadMediaService.downloadFile(
            'AUDIO',
            'whatsapp_',
            message.audio?.mime_type,
            '',
            message.audio?.sha256,
            message.timestamp,
            message.audio?.url,
            bearerToken,
            workspaceId,
          ),
        });
        break;
      case 'button':
        text = message.button?.text ?? null;
        break;
      case 'contacts':
        // TODO: when contacts send, create a new Person record or message?
        break;
      case 'document': {
        text = message.document?.caption ?? '';
        const fileType =
          message.document?.filename.endsWith('.txt') ||
          message.document?.filename.endsWith('.doc') ||
          message.document?.filename.endsWith('.docx') ||
          message.document?.filename.endsWith('.pdf')
            ? 'TEXT_DOCUMENT'
            : message.document?.filename.endsWith('.xls') ||
                message.document?.filename.endsWith('.xlsx')
              ? 'SPREADSHEET'
              : message.document?.filename.endsWith('.ppt') ||
                  message.document?.filename.endsWith('.pptx')
                ? 'PRESENTATION'
                : 'OTHER';

        attachments.push({
          filename: await this.whatsappDownloadMediaService.downloadFile(
            fileType,
            'whatsapp_',
            message.document?.mime_type,
            '',
            message.document?.sha256,
            message.timestamp,
            message.document?.url,
            bearerToken,
            workspaceId,
          ),
        });
        break;
      }
      case 'image':
        text = message.image?.caption ?? null;
        attachments.push({
          filename: await this.whatsappDownloadMediaService.downloadFile(
            'IMAGE',
            'whatsapp_',
            message.image?.mime_type,
            '',
            message.image?.sha256,
            message.timestamp,
            message.image?.url,
            bearerToken,
            workspaceId,
          ),
        });
        break;
      case 'interactive':
        text =
          message.interactive?.button_reply?.title ??
          `${message.interactive?.list_reply?.title} - ${message.interactive?.list_reply?.description}`;
        break;
      case 'location':
        text = `Place: ${message.location?.name}\nAddress: ${message.location?.address}Lat: ${message.location?.latitude}Long: ${message.location?.longitude}URL: <a href='${message.location?.url}'>${message.location?.url}</a>`;
        break;
      case 'order':
        text = message.order?.text ?? null; // TODO: ???
        break;
      case 'reaction':
        text =
          message.reaction?.emoji !== undefined
            ? `User reacted with ${message.reaction?.emoji} to ${message.reaction?.message_id}` // TODO: find a message text by message id?
            : `User removed ${message.reaction?.message_id} reaction to ${message.reaction?.message_id}`;
        break;
      case 'sticker':
        attachments.push({
          filename: await this.whatsappDownloadMediaService.downloadFile(
            'IMAGE',
            'whatsapp_',
            message.sticker?.mime_type,
            '',
            message.sticker?.sha256,
            message.timestamp,
            message.sticker?.url,
            bearerToken,
            workspaceId,
          ),
        });
        break;
      case 'text':
        text = message.text?.body ?? null;
        break;
      case 'video':
        text = message.video?.caption ?? null;
        attachments.push({
          filename: await this.whatsappDownloadMediaService.downloadFile(
            'VIDEO',
            'whatsapp_',
            message.video?.mime_type,
            '',
            message.video?.sha256,
            message.timestamp,
            message.video?.url,
            bearerToken,
            workspaceId,
          ),
        });
        break;
      default:
        break;
    }

    attachments.includes({ filename: '' })
      ? attachments.splice(
          attachments.findIndex((attachment) => attachment.filename === ''),
          1,
        )
      : null;

    return {
      headerMessageId: null,
      receivedAt: receivedAt,
      subject: null,
      text: text,
      attachments: attachments,
      externalId: externalId,
      messageThreadExternalId: '',
      direction: MessageDirection.INCOMING,
      participants: participants,
    };
  }
}
